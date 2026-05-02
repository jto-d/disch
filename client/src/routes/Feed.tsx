import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LiveDot } from "../components/LiveDot";
import { MarketCard } from "../components/MarketCard";
import { useAttendees, useMarkets, useMe } from "../lib/hooks";

export function FeedRoute() {
  const navigate = useNavigate();
  const me = useMe();
  const markets = useMarkets();
  const attendees = useAttendees();

  // Bounce to entry if no voter cookie.
  useEffect(() => {
    if (me.isSuccess && !me.data?.id) {
      navigate("/", { replace: true });
    }
  }, [me.isSuccess, me.data, navigate]);

  const list = [...(markets.data ?? [])].sort(
    (a, b) => b.aggregate.total - a.aggregate.total
  );

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
          {me.data?.name && (
            <div className="text-[12px] font-medium text-fg2 bg-bg2 px-[10px] py-1 rounded-lg">
              {me.data.name}
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

      {/* Feed */}
      <div className="px-[14px] py-3 flex flex-col gap-[10px]">
        {markets.isLoading ? (
          <div className="text-center px-5 py-16 text-fg3 text-[14px]">Loading markets…</div>
        ) : list.length === 0 ? (
          <div className="text-center px-5 py-16 text-fg3 text-[14px] leading-[1.6]">
            Waiting for the host to drop the first market…
          </div>
        ) : (
          list.map((m) => <MarketCard key={m.id} market={m} attendees={attendees.data ?? []} />)
        )}
      </div>
      <div className="h-8" />
    </div>
  );
}
