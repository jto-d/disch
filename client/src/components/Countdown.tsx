import { useCountdown } from "../lib/hooks";

export function Countdown({ iso }: { iso: string }) {
  const label = useCountdown(iso);
  if (!label) {
    return <span className="font-mono text-[12px] text-fg3 tabular">Closed</span>;
  }
  return <span className="font-mono text-[12px] text-fg2 tabular">{label}</span>;
}
