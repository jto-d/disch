import type { PickMarketDTO } from "@disch/shared";
import { Bar } from "./Bar";

type Props = {
  market: PickMarketDTO;
  muted: boolean;
  compact: boolean;
};

export function PickResult({ market, muted, compact }: Props) {
  const resolved = market.status === "RESOLVED";
  const all = market.aggregate.rows;
  const items = compact ? all.slice(0, 4) : all;

  return (
    <div className="flex flex-col gap-2">
      {items.map((row, i) => {
        const isWin = resolved && market.resolvedOptionId === row.attendeeId;
        const isLose = resolved && !isWin;
        const isLeader = i === 0 && !resolved;
        return (
          <div
            key={row.attendeeId}
            style={{ opacity: isLose ? 0.4 : 1 }}
            className="transition-opacity duration-300"
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className="text-[13px]"
                style={{
                  fontWeight: isLeader ? 600 : 400,
                  color: muted ? "var(--fg2)" : "var(--fg)",
                }}
              >
                {isWin ? "✓ " : ""}
                {row.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-fg3 font-mono tabular">{row.count}</span>
                <span
                  className="font-mono text-[13px] font-medium tabular text-right min-w-[36px]"
                  style={{
                    color: muted ? "var(--fg3)" : isWin ? "var(--accent)" : "var(--fg2)",
                  }}
                >
                  {row.pct}%
                </span>
              </div>
            </div>
            <Bar
              pct={row.pct}
              muted={muted && !isWin}
              color={isWin ? "var(--accent)" : isLeader ? "var(--fg)" : "var(--fg2)"}
            />
          </div>
        );
      })}
      {compact && all.length > items.length && (
        <div className="text-[12px] text-fg3 text-center">+{all.length - items.length} more</div>
      )}
    </div>
  );
}
