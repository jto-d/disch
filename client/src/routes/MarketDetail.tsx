import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { Countdown } from "../components/Countdown";
import { LiveDot } from "../components/LiveDot";
import { TypeTag } from "../components/StatusTag";
import { YesNoResult } from "../components/YesNoResult";
import { PickResult } from "../components/PickResult";
import { YesNoVoteUI } from "../components/YesNoVoteUI";
import { PickVoteUI } from "../components/PickVoteUI";
import { useAttendees, useCastVote, useMarket } from "../lib/hooks";
import { useToast } from "../components/Toast";

export function MarketDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const market = useMarket(id);
  const attendees = useAttendees();
  const cast = useCastVote(id ?? "");
  const toast = useToast();

  if (market.isLoading) {
    return (
      <div className="min-h-[100dvh] grid place-items-center text-fg3 text-[14px]">
        Loading…
      </div>
    );
  }
  if (!market.data) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="px-4 py-[14px] flex items-center gap-3 bg-white" style={{ borderBottom: "1px solid var(--border)" }}>
          <BackButton onClick={() => navigate("/feed")} />
          <div className="text-[14px] font-bold">Not found</div>
        </div>
        <div className="flex-1 grid place-items-center text-fg3 text-[14px]">
          That market doesn't exist.
        </div>
      </div>
    );
  }

  const m = market.data;
  const muted = m.status !== "OPEN";
  const resolved = m.status === "RESOLVED";
  const hasVoted = !!m.myVote;
  const total = m.type === "YES_NO" ? m.aggregate.total : m.aggregate.total;

  const handleVote = (optionValue: string) => {
    cast.mutate(optionValue, {
      onError: (e: any) => {
        const msg =
          e?.code === "already_voted"
            ? "You've already voted on this one"
            : e?.message ?? "Couldn't cast vote";
        toast(msg);
      },
    });
  };

  return (
    <div className="animate-fade-in fixed inset-0 bg-bg z-50 flex flex-col overflow-hidden mobile-shell">
      {/* Top bar */}
      <div
        className="px-4 py-[14px] bg-white flex items-center gap-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <BackButton onClick={() => navigate("/feed")} />
        <div className="flex-1">
          <div className="flex items-center gap-[6px]">
            <TypeTag type={m.type} />
            {m.status === "OPEN" && <LiveDot />}
          </div>
        </div>
        <Countdown iso={m.closeAt} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div
          className="text-heading mb-[6px]"
          style={{ color: muted ? "var(--fg2)" : "var(--fg)", fontSize: 22 }}
        >
          {m.question}
        </div>
        {resolved && m.resolvedLabel && (
          <div className="text-[13px] text-accent font-medium mb-1">
            Outcome: {m.resolvedLabel}
          </div>
        )}
        <div className="font-mono text-[12px] text-fg3 mb-5 tabular">
          {total} vote{total === 1 ? "" : "s"} total
        </div>

        {m.status === "OPEN" && !hasVoted ? (
          m.type === "YES_NO" ? (
            <YesNoVoteUI onVote={(opt) => handleVote(opt)} disabled={cast.isPending} />
          ) : (
            <PickVoteUI
              attendees={(attendees.data ?? []).filter((a) => a.active)}
              onVote={(id) => handleVote(id)}
              disabled={cast.isPending}
            />
          )
        ) : (
          <>
            <div className="text-[11px] font-bold tracking-[0.1em] text-fg3 uppercase font-mono mb-3">
              {m.status === "OPEN" ? "Live consensus" : "Results"}
            </div>
            {m.type === "YES_NO" ? (
              <YesNoResult market={m} muted={false} />
            ) : (
              <PickResult market={m} muted={false} compact={false} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
