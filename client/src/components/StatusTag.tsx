import type { MarketStatus, MarketType } from "@disch/shared";
import { LiveDot } from "./LiveDot";

export function TypeTag({ type }: { type: MarketType }) {
  return (
    <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-fg2 bg-bg2 px-[7px] py-[2px] rounded-xs2 font-mono">
      {type === "PICK_PERSON" ? "PICK" : "YES/NO"}
    </span>
  );
}

export function StatusBadge({ status }: { status: MarketStatus }) {
  if (status === "OPEN") return <LiveDot />;
  if (status === "RESOLVED") {
    return (
      <span className="text-[10px] font-bold tracking-[0.1em] text-accent font-mono">
        RESOLVED
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-[0.1em] text-fg3 font-mono">CLOSED</span>
  );
}
