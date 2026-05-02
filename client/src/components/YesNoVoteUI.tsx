import { useState } from "react";

export function YesNoVoteUI({
  onVote,
  disabled,
}: {
  onVote: (opt: "yes" | "no") => void;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState<"yes" | "no" | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {(["yes", "no"] as const).map((opt) => {
        const isPending = pending === opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (isPending) onVote(opt);
              else setPending(opt);
            }}
            className="rounded-sm2 text-[14px] font-semibold uppercase tracking-[0.08em] text-center transition-all duration-150 min-h-[44px]"
            style={{
              padding: "12px",
              border: `1px solid ${isPending ? "var(--accent)" : "var(--border)"}`,
              background: isPending ? "var(--accent-dim)" : "transparent",
              color: "var(--fg)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {isPending ? `Confirm — ${opt.toUpperCase()}` : opt.toUpperCase()}
          </button>
        );
      })}
      {pending && (
        <button
          type="button"
          onClick={() => setPending(null)}
          className="bg-transparent border-0 text-fg3 text-[12px] cursor-pointer p-1"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
