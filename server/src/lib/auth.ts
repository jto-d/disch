import type { CookieOptions, Request, Response, NextFunction } from "express";
import { env } from "./env.js";

export const VOTER_COOKIE = "voter_id";
export const ADMIN_COOKIE = "admin";

export const cookieBase: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProd,
  path: "/",
};

// 30-day cookie covers a single event comfortably.
export const VOTER_MAX_AGE = 1000 * 60 * 60 * 24 * 30;
// Admin sessions are shorter since the password is shared.
export const ADMIN_MAX_AGE = 1000 * 60 * 60 * 12;

export function setVoterCookie(res: Response, voterId: string) {
  res.cookie(VOTER_COOKIE, voterId, { ...cookieBase, maxAge: VOTER_MAX_AGE, signed: true });
}

export function setAdminCookie(res: Response) {
  res.cookie(ADMIN_COOKIE, "1", { ...cookieBase, maxAge: ADMIN_MAX_AGE, signed: true });
}

export function getVoterId(req: Request): string | null {
  const v = req.signedCookies?.[VOTER_COOKIE];
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function isAdmin(req: Request): boolean {
  return req.signedCookies?.[ADMIN_COOKIE] === "1";
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized", message: "Admin login required" });
    return;
  }
  next();
}

export function requireVoter(req: Request, res: Response, next: NextFunction) {
  if (getVoterId(req) || isAdmin(req)) {
    next();
    return;
  }
  res.status(401).json({ error: "unauthorized", message: "Sign in required" });
}
