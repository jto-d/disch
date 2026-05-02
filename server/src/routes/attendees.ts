import { Router } from "express";
import { CreateAttendeeReq, UpdateAttendeeReq } from "@disch/shared";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import { validateBody } from "../lib/validate.js";

export const attendeesRouter = Router();

// Public: list active attendees (for the voting UI).
attendeesRouter.get("/", async (_req, res) => {
  const list = await prisma.attendee.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(list);
});

// Admin: list all (active + inactive) for the admin attendees screen.
attendeesRouter.get("/all", requireAdmin, async (_req, res) => {
  const list = await prisma.attendee.findMany({ orderBy: { createdAt: "asc" } });
  res.json(list);
});

attendeesRouter.post("/", requireAdmin, validateBody(CreateAttendeeReq), async (req, res) => {
  const { name } = req.body as { name: string };
  const a = await prisma.attendee.create({ data: { name } });
  res.json(a);
});

attendeesRouter.patch(
  "/:id",
  requireAdmin,
  validateBody(UpdateAttendeeReq),
  async (req, res) => {
    const { active } = req.body as { active: boolean };
    const existing = await prisma.attendee.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "not_found", message: "Attendee not found" });
      return;
    }
    const a = await prisma.attendee.update({ where: { id: req.params.id }, data: { active } });
    res.json(a);
  }
);
