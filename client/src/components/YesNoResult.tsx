import type { YesNoMarketDTO } from "@disch/shared";
import { Bar } from "./Bar";

export function YesNoResult({ market, muted }: { market: YesNoMarketDTO; muted: boolean }) {
  const { yesPct, noPct, yesCount, noCount } = market.aggregate;
  const resolved = market.status === "RESOLVED";
  const yesWin = resolved && market.resolvedOptionId === "yes";
  const noWin = resolved && market.resolvedOptionId === "no";

  const rows: Array<{
    key: "yes" | "no";
    pct: number;
    count: number;
    isWin: boolean;
    isLose: boolean;
  }> = [
    { key: "yes", pct: yesPct, count: yesCount, isWin: yesWin, isLose: resolved && !yesWin },
    { key: "no", pct: noPct, count: noCount, isWin: noWin, isLose: resolved && !noWin },
  ];

  return (
    <div className="flex flex-col gap-[10px]">
      {rows.map(({ key, pct, count, isWin, isLose }) => (
        <div
          key={key}
          className="rounded-sm2 px-3 py-[10px] transition-all duration-300"
          style={{
            border: `1px solid ${isWin ? "var(--accent)" : "var(--border)"}`,
            background: isWin ? "var(--accent-dim)" : "transparent",
            opacity: isLose ? 0.45 : 1,
          }}
        >
          <div className="flex justify-between items-center mb-[6px]">
            <span
              className="text-[13px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: muted ? "var(--fg2)" : "var(--fg)" }}
            >
              {isWin && "✓ "}
              {key}
            </span>
            <span
              className="font-mono text-[15px] font-medium tabular"
              style={{
                color: muted ? "var(--fg2)" : isWin ? "var(--accent)" : "var(--fg)",
              }}
            >
              {pct}%
            </span>
          </div>
          <Bar pct={pct} muted={muted && !isWin} color={isWin ? "var(--accent)" : "var(--fg2)"} />
          <div className="mt-[5px] text-[11px] text-fg3 font-mono tabular">
            {count} vote{count === 1 ? "" : "s"}
          </div>
        </div>
      ))}
    </div>
  );
}
