import { Router } from "express";
import { Prisma } from "@prisma/client";
import { CastVoteReq } from "@disch/shared";
import { prisma } from "../lib/prisma.js";
import { getVoterId } from "../lib/auth.js";
import { sortMarkets, toDTO, deriveStatus } from "../lib/markets.js";
import { validateBody } from "../lib/validate.js";

export const marketsRouter = Router();

marketsRouter.get("/", async (req, res) => {
  const voterId = getVoterId(req);
  const [markets, attendees] = await Promise.all([
    prisma.market.findMany({ include: { votes: true } }),
    prisma.attendee.findMany(),
  ]);
  const dtos = markets.map((m) => toDTO(m, attendees, voterId));
  res.json(sortMarkets(dtos));
});

marketsRouter.get("/:id", async (req, res) => {
  const voterId = getVoterId(req);
  const market = await prisma.market.findUnique({
    where: { id: req.params.id },
    include: { votes: true },
  });
  if (!market) {
    res.status(404).json({ error: "not_found", message: "Market not found" });
    return;
  }
  const attendees = await prisma.attendee.findMany();
  res.json(toDTO(market, attendees, voterId));
});

marketsRouter.post("/:id/vote", validateBody(CastVoteReq), async (req, res) => {
  const voterId = getVoterId(req);
  if (!voterId) {
    res.status(401).json({ error: "no_voter", message: "Set your name first" });
    return;
  }

  const market = await prisma.market.findUnique({
    where: { id: req.params.id },
    include: { votes: true },
  });
  if (!market) {
    res.status(404).json({ error: "not_found", message: "Market not found" });
    return;
  }
  const status = deriveStatus(market);
  if (status !== "OPEN") {
    res.status(409).json({ error: "market_closed", message: "Voting is closed on this market" });
    return;
  }

  const { optionValue } = req.body as { optionValue: string };

  if (market.type === "YES_NO") {
    if (optionValue !== "yes" && optionValue !== "no") {
      res.status(400).json({ error: "bad_option", message: "Option must be 'yes' or 'no'" });
      return;
    }
  } else {
    const attendee = await prisma.attendee.findUnique({ where: { id: optionValue } });
    if (!attendee || !attendee.active) {
      res.status(400).json({ error: "bad_option", message: "Pick a valid attendee" });
      return;
    }
  }

  try {
    await prisma.vote.create({
      data: { marketId: market.id, voterId, optionValue },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      res
        .status(409)
        .json({ error: "already_voted", message: "You've already voted on this one" });
      return;
    }
    throw e;
  }

  const fresh = await prisma.market.findUnique({
    where: { id: market.id },
    include: { votes: true },
  });
  const attendees = await prisma.attendee.findMany();
  res.json(toDTO(fresh!, attendees, voterId));
});
