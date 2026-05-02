import type {
  AttendeeDTO,
  MarketDTO,
  VoterDTO,
  CreateMarketReq,
} from "@disch/shared";

class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(data?.message ?? res.statusText, res.status, data?.error);
  }
  return data as T;
}

export const api = {
  // voter
  createVoter(name: string) {
    return req<VoterDTO>("POST", "/api/voter", { name });
  },
  getMe() {
    return req<VoterDTO | undefined>("GET", "/api/voter/me");
  },

  // markets
  listMarkets() {
    return req<MarketDTO[]>("GET", "/api/markets");
  },
  getMarket(id: string) {
    return req<MarketDTO>("GET", `/api/markets/${id}`);
  },
  vote(marketId: string, optionValue: string) {
    return req<MarketDTO>("POST", `/api/markets/${marketId}/vote`, { optionValue });
  },

  // attendees
  listAttendees() {
    return req<AttendeeDTO[]>("GET", "/api/attendees");
  },
  listAllAttendees() {
    return req<AttendeeDTO[]>("GET", "/api/attendees/all");
  },
  createAttendee(name: string) {
    return req<AttendeeDTO>("POST", "/api/attendees", { name });
  },
  setAttendeeActive(id: string, active: boolean) {
    return req<AttendeeDTO>("PATCH", `/api/attendees/${id}`, { active });
  },

  // admin
  adminAuth(password: string) {
    return req<{ ok: true }>("POST", "/api/admin/auth", { password });
  },
  adminLogout() {
    return req<{ ok: true }>("POST", "/api/admin/logout");
  },
  adminSession() {
    return req<{ admin: boolean }>("GET", "/api/admin/session");
  },
  createMarket(input: CreateMarketReq) {
    return req<{ id: string }>("POST", "/api/admin/markets", input);
  },
  resolveMarket(id: string, resolvedOptionId: string) {
    return req<{ ok: true }>("POST", `/api/admin/markets/${id}/resolve`, { resolvedOptionId });
  },
};

export { ApiError };
