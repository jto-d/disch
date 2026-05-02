import { useState } from "react";
import type { AttendeeDTO } from "@disch/shared";

export function PickVoteUI({
  attendees,
  onVote,
  disabled,
}: {
  attendees: AttendeeDTO[];
  onVote: (attendeeId: string) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selectedAttendee = attendees.find((a) => a.id === selected);

  if (attendees.length === 0) {
    return (
      <div className="text-[13px] text-fg3 text-center py-2">
        No attendees yet — ask the host to add some.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-[6px] mb-[10px]">
        {attendees.map((a) => {
          const isSel = selected === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSelected(a.id);
                setConfirming(false);
              }}
              className="rounded-sm2 text-left flex items-center gap-[10px] transition-all duration-150 min-h-[44px]"
              style={{
                padding: "11px 14px",
                border: `1px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
                background: isSel ? "var(--accent-dim)" : "transparent",
                color: "var(--fg)",
                fontSize: 14,
                fontWeight: isSel ? 600 : 400,
              }}
            >
              <span
                className="flex items-center justify-center shrink-0 transition-all duration-150"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `1.5px solid ${isSel ? "var(--accent)" : "var(--fg3)"}`,
                  background: isSel ? "var(--accent)" : "transparent",
                }}
              >
                {isSel && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--bg)",
                    }}
                  />
                )}
              </span>
              {a.name}
            </button>
          );
        })}
      </div>
      {selected && selectedAttendee && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (confirming) onVote(selected);
            else setConfirming(true);
          }}
          className="rounded-sm2 text-[14px] font-bold transition-all duration-200 min-h-[44px]"
          style={{
            padding: "13px",
            background: confirming ? "var(--accent)" : "var(--fg)",
            color: confirming ? "var(--fg)" : "var(--bg)",
            border: "none",
            letterSpacing: "0.02em",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.7 : 1,
          }}
        >
          {confirming ? `Confirm — ${selectedAttendee.name}` : "Lock in vote"}
        </button>
      )}
    </div>
  );
}
