import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { GoogleSignInReq } from "@disch/shared";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import { setVoterCookie } from "../lib/auth.js";
import { validateBody } from "../lib/validate.js";

export const voterRouter = Router();

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

voterRouter.post("/google", validateBody(GoogleSignInReq), async (req, res) => {
  const { idToken } = req.body as { idToken: string };

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401).json({ error: "bad_token", message: "Invalid Google token" });
    return;
  }
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    res.status(401).json({ error: "bad_token", message: "Invalid Google token" });
    return;
  }

  const email = payload.email.toLowerCase();
  const allowedDomain = env.ALLOWED_EMAIL_DOMAIN.toLowerCase();
  if (!email.endsWith(`@${allowedDomain}`)) {
    res.status(403).json({
      error: "wrong_domain",
      message: `Sign in with your @${allowedDomain} account`,
    });
    return;
  }

  const name = payload.name?.trim() || payload.given_name || email.split("@")[0];

  const voter = await prisma.voter.upsert({
    where: { googleSub: payload.sub },
    create: { googleSub: payload.sub, email, name },
    update: { email, name },
  });

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
