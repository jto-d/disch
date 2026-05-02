import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const MarketType = z.enum(["YES_NO", "PICK_PERSON"]);
export type MarketType = z.infer<typeof MarketType>;

export const MarketStatus = z.enum(["OPEN", "CLOSED", "RESOLVED"]);
export type MarketStatus = z.infer<typeof MarketStatus>;

// ─── Domain models (server-derived) ──────────────────────────────────────────
export const VoterDTO = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
export type VoterDTO = z.infer<typeof VoterDTO>;

export const AttendeeDTO = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
});
export type AttendeeDTO = z.infer<typeof AttendeeDTO>;

// YES_NO aggregate
export const YesNoAggregate = z.object({
  yesCount: z.number().int().nonnegative(),
  noCount: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  yesPct: z.number().min(0).max(100),
  noPct: z.number().min(0).max(100),
});
export type YesNoAggregate = z.infer<typeof YesNoAggregate>;

// PICK_PERSON aggregate row
export const PickRow = z.object({
  attendeeId: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  count: z.number().int().nonnegative(),
  pct: z.number().min(0).max(100),
});
export type PickRow = z.infer<typeof PickRow>;

export const PickAggregate = z.object({
  total: z.number().int().nonnegative(),
  rows: z.array(PickRow),
});
export type PickAggregate = z.infer<typeof PickAggregate>;

// MarketDTO — discriminated by `type`
const MarketBase = z.object({
  id: z.string().uuid(),
  question: z.string(),
  closeAt: z.string(), // ISO
  createdAt: z.string(),
  status: MarketStatus,
  resolvedOptionId: z.string().nullable(),
  resolvedLabel: z.string().nullable(), // "yes" / "no" / attendee.name
  myVote: z.string().nullable(), // optionValue cast by current voter, if any
});

export const YesNoMarketDTO = MarketBase.extend({
  type: z.literal("YES_NO"),
  aggregate: YesNoAggregate,
});
export type YesNoMarketDTO = z.infer<typeof YesNoMarketDTO>;

export const PickMarketDTO = MarketBase.extend({
  type: z.literal("PICK_PERSON"),
  aggregate: PickAggregate,
});
export type PickMarketDTO = z.infer<typeof PickMarketDTO>;

export const MarketDTO = z.discriminatedUnion("type", [
  YesNoMarketDTO,
  PickMarketDTO,
]);
export type MarketDTO = z.infer<typeof MarketDTO>;

// ─── Request schemas ─────────────────────────────────────────────────────────
export const GoogleSignInReq = z.object({
  idToken: z.string().min(1),
});
export type GoogleSignInReq = z.infer<typeof GoogleSignInReq>;

export const CastVoteReq = z.object({
  optionValue: z.string().min(1),
});
export type CastVoteReq = z.infer<typeof CastVoteReq>;

export const AdminAuthReq = z.object({
  password: z.string().min(1),
});
export type AdminAuthReq = z.infer<typeof AdminAuthReq>;

export const CreateAttendeeReq = z.object({
  name: z.string().trim().min(1).max(40),
});
export type CreateAttendeeReq = z.infer<typeof CreateAttendeeReq>;

export const UpdateAttendeeReq = z.object({
  active: z.boolean(),
});
export type UpdateAttendeeReq = z.infer<typeof UpdateAttendeeReq>;

export const CreateMarketReq = z
  .object({
    question: z.string().trim().min(3).max(200),
    type: MarketType,
    closeAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
      message: "closeAt must be a valid ISO date",
    }),
  })
  .refine((m) => new Date(m.closeAt).getTime() > Date.now(), {
    message: "closeAt must be in the future",
    path: ["closeAt"],
  });
export type CreateMarketReq = z.infer<typeof CreateMarketReq>;

export const ResolveMarketReq = z.object({
  resolvedOptionId: z.string().min(1),
});
export type ResolveMarketReq = z.infer<typeof ResolveMarketReq>;

// ─── Response wrappers ───────────────────────────────────────────────────────
export const ApiError = z.object({
  error: z.string(),
  message: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiError>;
