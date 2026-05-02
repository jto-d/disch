import { Router } from "express";
import {
  AdminAuthReq,
  CreateMarketReq,
  ResolveMarketReq,
} from "@disch/shared";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import {
  ADMIN_COOKIE,
  cookieBase,
  isAdmin,
  requireAdmin,
  setAdminCookie,
} from "../lib/auth.js";
import { deriveStatus } from "../lib/markets.js";
import { validateBody } from "../lib/validate.js";

export const adminRouter = Router();

adminRouter.post("/auth", validateBody(AdminAuthReq), (req, res) => {
  const { password } = req.body as { password: string };
  if (password !== env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "bad_password", message: "Wrong password" });
    return;
  }
  setAdminCookie(res);
  res.json({ ok: true });
});

adminRouter.post("/logout", (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, cookieBase);
  res.json({ ok: true });
});

adminRouter.get("/session", (req, res) => {
  res.json({ admin: isAdmin(req) });
});

adminRouter.post(
  "/markets",
  requireAdmin,
  validateBody(CreateMarketReq),
  async (req, res) => {
    const { question, type, closeAt } = req.body as {
      question: string;
      type: "YES_NO" | "PICK_PERSON";
      closeAt: string;
    };
    const m = await prisma.market.create({
      data: { question, type, closeAt: new Date(closeAt) },
    });
    res.json({ id: m.id });
  }
);

adminRouter.post(
  "/markets/:id/resolve",
  requireAdmin,
  validateBody(ResolveMarketReq),
  async (req, res) => {
    const { resolvedOptionId } = req.body as { resolvedOptionId: string };
    const market = await prisma.market.findUnique({ where: { id: req.params.id } });
    if (!market) {
      res.status(404).json({ error: "not_found", message: "Market not found" });
      return;
    }
    if (market.resolvedOptionId) {
      res
        .status(409)
        .json({ error: "already_resolved", message: "This market is already resolved" });
      return;
    }
    if (deriveStatus(market) !== "CLOSED") {
      res.status(409).json({
        error: "not_closed",
        message: "Wait until the market closes before resolving",
      });
      return;
    }
    if (market.type === "YES_NO") {
      if (resolvedOptionId !== "yes" && resolvedOptionId !== "no") {
        res.status(400).json({ error: "bad_option", message: "Outcome must be yes or no" });
        return;
      }
    } else {
      const attendee = await prisma.attendee.findUnique({ where: { id: resolvedOptionId } });
      if (!attendee) {
        res.status(400).json({ error: "bad_option", message: "Outcome must be a valid attendee" });
        return;
      }
    }
    await prisma.market.update({
      where: { id: market.id },
      data: { resolvedOptionId },
    });
    res.json({ ok: true });
  }
);
