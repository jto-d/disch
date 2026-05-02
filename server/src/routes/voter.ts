import { Router } from "express";
import { CreateVoterReq } from "@disch/shared";
import { prisma } from "../lib/prisma.js";
import { setVoterCookie } from "../lib/auth.js";
import { validateBody } from "../lib/validate.js";

export const voterRouter = Router();

// HONOR-SYSTEM CAVEAT:
// A determined user can clear their cookie and re-register under a new name to
// vote again. We accept this for the use case (a single drinking event); the DB
// unique constraint on (marketId, voterId) only enforces "one vote per cookie
// identity per market". This is intentional — there is no real auth.
voterRouter.post("/", validateBody(CreateVoterReq), async (req, res) => {
  const { name } = req.body as { name: string };
  const voter = await prisma.voter.create({ data: { name } });
  setVoterCookie(res, voter.id);
  res.json({ id: voter.id, name: voter.name });
});

voterRouter.get("/me", async (req, res) => {
  const id = (req as any).signedCookies?.voter_id as string | undefined;
  if (!id) {
    res.status(204).end();
    return;
  }
  const v = await prisma.voter.findUnique({ where: { id } });
  if (!v) {
    res.status(204).end();
    return;
  }
  res.json({ id: v.id, name: v.name });
});
