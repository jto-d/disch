import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VoterDTO } from "@disch/shared";
import { LiveDot } from "../components/LiveDot";
import { MarketCard } from "../components/MarketCard";
import { useAttendees, useMarkets, useMe } from "../lib/hooks";

type FeedFilter = "ALL" | "PENDING" | "VOTED";

export function FeedRoute() {
  const navigate = useNavigate();
  const me = useMe();

  // Bounce to entry if me resolved with no voter cookie or failed to load.
  useEffect(() => {
    if ((me.isSuccess && !me.data?.id) || me.isError) {
      navigate("/", { replace: true });
    }
  }, [me.isSuccess, me.isError, me.data, navigate]);

  // Don't render — and don't kick off markets/attendees fetches — until the
  // voter session is confirmed. Server-side endpoints also require it.
  if (!me.data?.id) {
    return (
      <div className="min-h-[100dvh] bg-bg grid place-items-center text-fg3 text-[14px]">
        Loading…
      </div>
    );
  }

  return <FeedContent me={me.data} />;
}

function FeedContent({ me }: { me: VoterDTO }) {
  const navigate = useNavigate();
  const markets = useMarkets();
  const attendees = useAttendees();
  const [filter, setFilter] = useState<FeedFilter>("ALL");

  const all = markets.data ?? [];
  const list =
    filter === "PENDING"
      ? all.filter((m) => m.myVote == null)
      : filter === "VOTED"
      ? all.filter((m) => m.myVote != null)
      : all;

  return (
    <div className="min-h-[100dvh] bg-bg">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <div className="text-[11px] font-bold text-fg3 tracking-[0.15em] font-mono">
            DISCH MARKET
          </div>
          <div className="flex items-center gap-[6px] mt-[2px]">
            <LiveDot />
            <span className="text-[11px] text-fg2 font-mono tabular">
              {attendees.data?.length ?? 0} in the Disch
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[10px]">
          {me.name && (
            <div className="text-[12px] font-medium text-fg2 bg-bg2 px-[10px] py-1 rounded-lg">
              {me.name}
            </div>
          )}
          <button
            type="button"
            aria-label="Admin"
            onClick={() => navigate("/admin")}
            className="bg-transparent rounded-lg px-[10px] py-1 text-[14px] text-fg3 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ border: "1px solid var(--border)" }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="px-[14px] pt-3">
        <div
          className="flex bg-white p-[3px]"
          style={{ border: "1px solid var(--border)", borderRadius: 10 }}
        >
          {(
            [
              ["ALL", "All"],
              ["PENDING", "Pending"],
              ["VOTED", "Voted"],
            ] as const
          ).map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className="flex-1 py-[7px] text-[12px] font-semibold cursor-pointer min-h-[36px]"
                style={{
                  background: active ? "var(--fg)" : "transparent",
                  color: active ? "var(--bg)" : "var(--fg2)",
                  border: "none",
                  borderRadius: 8,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="px-[14px] py-3 flex flex-col gap-[10px]">
        {markets.isLoading ? (
          <div className="text-center px-5 py-16 text-fg3 text-[14px]">Loading markets…</div>
        ) : list.length === 0 ? (
          <div className="text-center px-5 py-16 text-fg3 text-[14px] leading-[1.6]">
            {all.length === 0
              ? "Waiting for the host to drop the first market…"
              : filter === "PENDING"
              ? "You're caught up — nothing pending."
              : "You haven't voted on anything yet."}
          </div>
        ) : (
          list.map((m) => <MarketCard key={m.id} market={m} attendees={attendees.data ?? []} />)
        )}
      </div>
      <div className="h-8" />
    </div>
  );
}
