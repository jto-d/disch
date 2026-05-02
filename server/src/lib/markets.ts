import type { Market, Vote, Attendee } from "@prisma/client";
import type { MarketDTO, MarketStatus } from "@disch/shared";

export function deriveStatus(m: Pick<Market, "closeAt" | "resolvedOptionId">): MarketStatus {
  if (m.resolvedOptionId) return "RESOLVED";
  if (m.closeAt.getTime() <= Date.now()) return "CLOSED";
  return "OPEN";
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

type MarketWithVotes = Market & { votes: Vote[] };

export function toDTO(
  m: MarketWithVotes,
  attendees: Attendee[],
  voterId: string | null
): MarketDTO {
  const status = deriveStatus(m);
  const myVote =
    voterId == null ? null : (m.votes.find((v) => v.voterId === voterId)?.optionValue ?? null);

  if (m.type === "YES_NO") {
    const yesCount = m.votes.filter((v) => v.optionValue === "yes").length;
    const noCount = m.votes.filter((v) => v.optionValue === "no").length;
    const total = yesCount + noCount;
    const yesPct = pct(yesCount, total);
    const noPct = total === 0 ? 0 : 100 - yesPct;
    const resolvedLabel =
      m.resolvedOptionId === "yes" ? "yes" : m.resolvedOptionId === "no" ? "no" : null;

    return {
      id: m.id,
      type: "YES_NO",
      question: m.question,
      closeAt: m.closeAt.toISOString(),
      createdAt: m.createdAt.toISOString(),
      status,
      resolvedOptionId: m.resolvedOptionId,
      resolvedLabel,
      myVote,
      aggregate: { yesCount, noCount, total, yesPct, noPct },
    };
  }

  // PICK_PERSON
  const counts = new Map<string, number>();
  for (const v of m.votes) {
    counts.set(v.optionValue, (counts.get(v.optionValue) ?? 0) + 1);
  }
  const total = m.votes.length;

  const rows = attendees
    .map((a) => {
      const count = counts.get(a.id) ?? 0;
      return {
        attendeeId: a.id,
        name: a.name,
        active: a.active,
        count,
        pct: pct(count, total),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Include votes for attendees who may have been hard-deleted in some edge case
  // (kept for safety; we use soft-delete via `active`, so this is normally a no-op).
  for (const [optionValue] of counts) {
    if (!attendees.some((a) => a.id === optionValue)) {
      const count = counts.get(optionValue) ?? 0;
      rows.push({
        attendeeId: optionValue,
        name: "(removed)",
        active: false,
        count,
        pct: pct(count, total),
      });
    }
  }
  rows.sort((a, b) => b.count - a.count);

  const winner = m.resolvedOptionId
    ? attendees.find((a) => a.id === m.resolvedOptionId)
    : undefined;

  return {
    id: m.id,
    type: "PICK_PERSON",
    question: m.question,
    closeAt: m.closeAt.toISOString(),
    createdAt: m.createdAt.toISOString(),
    status,
    resolvedOptionId: m.resolvedOptionId,
    resolvedLabel: winner?.name ?? null,
    myVote,
    aggregate: { total, rows },
  };
}

export function sortMarkets(markets: MarketDTO[]): MarketDTO[] {
  // OPEN by closeAt asc, then CLOSED unresolved by closeAt asc, then RESOLVED by createdAt desc.
  const order: Record<MarketStatus, number> = { OPEN: 0, CLOSED: 1, RESOLVED: 2 };
  return [...markets].sort((a, b) => {
    if (a.status !== b.status) return order[a.status] - order[b.status];
    if (a.status === "RESOLVED") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime();
  });
}
