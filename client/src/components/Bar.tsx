type Props = {
  pct: number;
  color?: string; // CSS color or var
  muted?: boolean;
  animate?: boolean;
};

export function Bar({ pct, color = "var(--accent)", muted = false, animate = true }: Props) {
  return (
    <div
      className="h-[6px] rounded-[3px] overflow-hidden"
      style={{ background: muted ? "var(--border)" : "var(--bg2)" }}
    >
      <div
        className="h-full rounded-[3px]"
        style={{
          background: muted ? "var(--fg3)" : color,
          width: `${pct}%`,
          transition: animate ? "width 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      />
    </div>
  );
}
