import { useNavigate } from "react-router-dom";
import type { AttendeeDTO, MarketDTO } from "@disch/shared";
import { Countdown } from "./Countdown";
import { StatusBadge, TypeTag } from "./StatusTag";
import { YesNoResult } from "./YesNoResult";
import { PickResult } from "./PickResult";
import { YesNoVoteUI } from "./YesNoVoteUI";
import { PickVoteUI } from "./PickVoteUI";
import { useCastVote } from "../lib/hooks";
import { useToast } from "./Toast";

export function MarketCard({
  market,
  attendees,
}: {
  market: MarketDTO;
  attendees: AttendeeDTO[];
}) {
  const navigate = useNavigate();
  const cast = useCastVote(market.id);
  const toast = useToast();

  const muted = market.status !== "OPEN";
  const resolved = market.status === "RESOLVED";
  const total =
    market.type === "YES_NO" ? market.aggregate.total : market.aggregate.total;
  const hasVoted = !!market.myVote;

  const goDetail = () => navigate(`/market/${market.id}`);

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

  // Resolve a label for "Voted · X" footer.
  let votedLabel: string | null = null;
  if (market.myVote) {
    if (market.type === "YES_NO") votedLabel = market.myVote.toUpperCase();
    else {
      const a = market.aggregate.rows.find((r) => r.attendeeId === market.myVote);
      votedLabel = a?.name ?? "—";
    }
  }

  return (
    <div
      className="animate-slide-up bg-white rounded-card cursor-pointer transition-[opacity,transform] duration-200"
      style={{
        border: "1px solid var(--border)",
        padding: "16px",
        opacity: muted ? 0.78 : 1,
      }}
      onClick={goDetail}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <TypeTag type={market.type} />
            <StatusBadge status={market.status} />
          </div>
          <div
            className="text-cardq"
            style={{ color: muted ? "var(--fg2)" : "var(--fg)" }}
          >
            {market.question}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <Countdown iso={market.closeAt} />
        </div>
      </div>

      {/* Vote UI or results — clicks here shouldn't trigger navigation. */}
      <div onClick={(e) => e.stopPropagation()}>
        {market.status === "OPEN" && !hasVoted ? (
          market.type === "YES_NO" ? (
            <YesNoVoteUI onVote={(opt) => handleVote(opt)} disabled={cast.isPending} />
          ) : (
            <PickVoteUI
              attendees={attendees.filter((a) => a.active)}
              onVote={(id) => handleVote(id)}
              disabled={cast.isPending}
            />
          )
        ) : market.type === "YES_NO" ? (
          <YesNoResult market={market} muted={muted && !resolved} />
        ) : (
          <PickResult market={market} muted={muted && !resolved} compact />
        )}
      </div>

      {/* Footer */}
      <div
        className="flex justify-between items-center mt-3 pt-[10px]"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[11px] text-fg3 tabular">
          {total} vote{total === 1 ? "" : "s"}
        </span>
        {hasVoted && market.status === "OPEN" && (
          <span className="text-[11px] text-accent font-medium">
            ✓ Voted · {votedLabel}
          </span>
        )}
        {resolved && market.resolvedLabel && (
          <span className="text-[11px] text-accent font-medium">
            Outcome: {market.resolvedLabel}
          </span>
        )}
      </div>
    </div>
  );
}
