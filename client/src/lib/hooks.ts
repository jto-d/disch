import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateMarketReq, MarketDTO } from "@disch/shared";
import { api } from "./api";

// ─── Voter session ───────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
    staleTime: Infinity,
  });
}

export function useSignInWithGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idToken: string) => api.signInWithGoogle(idToken),
    onSuccess: (voter) => {
      qc.setQueryData(["me"], voter);
    },
  });
}

// ─── Markets ─────────────────────────────────────────────────────────────────
export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: () => api.listMarkets(),
    refetchInterval: 5000,
  });
}

export function useMarket(id: string | undefined) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => api.getMarket(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });
}

export function useCastVote(marketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionValue: string) => api.vote(marketId, optionValue),
    onSuccess: (updated: MarketDTO) => {
      qc.setQueryData(["market", marketId], updated);
      qc.setQueryData<MarketDTO[]>(["markets"], (prev) =>
        prev ? prev.map((m) => (m.id === marketId ? updated : m)) : prev
      );
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

// ─── Attendees ───────────────────────────────────────────────────────────────
export function useAttendees() {
  return useQuery({
    queryKey: ["attendees"],
    queryFn: () => api.listAttendees(),
    staleTime: 5000,
  });
}

export function useAllAttendees() {
  return useQuery({
    queryKey: ["attendees", "all"],
    queryFn: () => api.listAllAttendees(),
  });
}

export function useCreateAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createAttendee(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendees"] });
    },
  });
}

export function useSetAttendeeActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.setAttendeeActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendees"] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export function useAdminSession() {
  return useQuery({
    queryKey: ["admin", "session"],
    queryFn: () => api.adminSession(),
    staleTime: 30_000,
  });
}

export function useAdminAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => api.adminAuth(password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useCreateMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMarketReq) => api.createMarket(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

export function useResolveMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolvedOptionId }: { id: string; resolvedOptionId: string }) =>
      api.resolveMarket(id, resolvedOptionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

// ─── Countdown ───────────────────────────────────────────────────────────────
// Updates every second client-side without refetching the list.
export function useCountdown(iso: string): string | null {
  const [label, setLabel] = useState(() => formatCountdown(iso));
  useEffect(() => {
    setLabel(formatCountdown(iso));
    const t = setInterval(() => setLabel(formatCountdown(iso)), 1000);
    return () => clearInterval(t);
  }, [iso]);
  return label;
}

function formatCountdown(iso: string): string | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
