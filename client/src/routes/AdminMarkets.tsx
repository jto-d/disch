import { useState } from "react";
import type { MarketDTO, MarketType } from "@disch/shared";
import {
  useAllAttendees,
  useCreateMarket,
  useMarkets,
  useResolveMarket,
} from "../lib/hooks";
import { useToast } from "../components/Toast";

export function AdminMarkets() {
  const markets = useMarkets();
  const create = useCreateMarket();
  const resolve = useResolveMarket();
  const allAttendees = useAllAttendees();
  const toast = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<MarketType>("YES_NO");
  const [closeAt, setCloseAt] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmOption, setConfirmOption] = useState<{ id: string; label: string } | null>(null);

  const submit = () => {
    if (!q.trim() || !closeAt) return;
    const closeIso = new Date(closeAt).toISOString();
    if (new Date(closeIso).getTime() <= Date.now()) {
      toast("Close time must be in the future");
      return;
    }
    create.mutate(
      { question: q.trim(), type, closeAt: closeIso },
      {
        onSuccess: () => {
          setQ("");
          setCloseAt("");
          setShowCreate(false);
          toast("Market published");
        },
        onError: (e: any) => toast(e?.message ?? "Couldn't create"),
      }
    );
  };

  const list = markets.data ?? [];

  const handleResolve = (m: MarketDTO, optionId: string, label: string) => {
    setResolvingId(null);
    setConfirmId(m.id);
    setConfirmOption({ id: optionId, label });
  };

  const confirmResolve = () => {
    if (!confirmId || !confirmOption) return;
    resolve.mutate(
      { id: confirmId, resolvedOptionId: confirmOption.id },
      {
        onSuccess: () => {
          toast("Market resolved");
          setConfirmId(null);
          setConfirmOption(null);
        },
        onError: (e: any) => toast(e?.message ?? "Couldn't resolve"),
      }
    );
  };

  return (
    <div className="animate-slide-up">
      {!showCreate ? (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full py-[13px] mb-4 text-[14px] font-bold cursor-pointer min-h-[44px]"
          style={{
            background: "var(--fg)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 10,
          }}
        >
          + Create market
        </button>
      ) : (
        <div
          className="bg-white p-4 mb-4"
          style={{ border: "1px solid var(--border)", borderRadius: 12 }}
        >
          <div className="text-[13px] font-bold mb-[14px]">New Market</div>
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-fg2 tracking-[0.05em] block mb-[6px]">
              QUESTION
            </label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What will happen tonight?"
              rows={2}
              maxLength={200}
              className="w-full px-3 py-[11px] text-[14px] bg-bg text-fg outline-none resize-none leading-[1.4]"
              style={{ border: "1px solid var(--border)", borderRadius: 8 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fg)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-fg2 tracking-[0.05em] block mb-[6px]">
              TYPE
            </label>
            <div className="flex gap-2">
              {(["YES_NO", "PICK_PERSON"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-[9px] text-[12px] font-bold cursor-pointer font-mono tracking-[0.05em] uppercase"
                  style={{
                    border: `1px solid ${type === t ? "var(--fg)" : "var(--border)"}`,
                    background: type === t ? "var(--fg)" : "transparent",
                    color: type === t ? "var(--bg)" : "var(--fg2)",
                    borderRadius: 8,
                  }}
                >
                  {t === "YES_NO" ? "YES/NO" : "PICK"}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-[14px]">
            <label className="text-[11px] font-semibold text-fg2 tracking-[0.05em] block mb-[6px]">
              CLOSES AT
            </label>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
              className="w-full px-3 py-[11px] text-[13px] font-mono bg-bg text-fg outline-none"
              style={{ border: "1px solid var(--border)", borderRadius: 8 }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-[11px] text-[13px] cursor-pointer min-h-[44px]"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--fg2)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!q.trim() || !closeAt || create.isPending}
              className="flex-[2] py-[11px] text-[13px] font-bold cursor-pointer min-h-[44px]"
              style={{
                background: q.trim() && closeAt ? "var(--fg)" : "var(--border)",
                color: q.trim() && closeAt ? "var(--bg)" : "var(--fg3)",
                border: "none",
                borderRadius: 10,
              }}
            >
              Publish
            </button>
          </div>
        </div>
      )}

      <div className="text-[11px] font-bold tracking-[0.1em] text-fg3 font-mono uppercase mb-2">
        Markets · {list.length}
      </div>
      <div className="flex flex-col gap-2">
        {list.map((m) => (
          <AdminMarketRow
            key={m.id}
            m={m}
            attendees={(allAttendees.data ?? []).filter((a) => a.active)}
            isResolving={resolvingId === m.id}
            onStartResolve={() => setResolvingId(m.id)}
            onCancelResolve={() => setResolvingId(null)}
            onPickOutcome={(optionId, label) => handleResolve(m, optionId, label)}
          />
        ))}
        {list.length === 0 && (
          <div className="text-[13px] text-fg3 text-center py-10">No markets yet.</div>
        )}
      </div>

      {confirmId && confirmOption && (
        <div className="fixed inset-0 z-[200] bg-fg/40 grid place-items-center px-5 animate-fade-in">
          <div
            className="bg-white p-5 w-full max-w-[360px]"
            style={{ border: "1px solid var(--border)", borderRadius: 12 }}
          >
            <div className="text-[14px] font-bold mb-1">Resolve market?</div>
            <div className="text-[13px] text-fg2 leading-[1.5] mb-4">
              Marking the outcome as <strong>{confirmOption.label}</strong>. This can't be
              undone.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmId(null);
                  setConfirmOption(null);
                }}
                className="flex-1 py-[11px] text-[13px] cursor-pointer min-h-[44px]"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--fg2)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResolve}
                disabled={resolve.isPending}
                className="flex-[2] py-[11px] text-[13px] font-bold cursor-pointer min-h-[44px]"
                style={{
                  background: "var(--accent)",
                  color: "var(--fg)",
                  border: "none",
                  borderRadius: 10,
                }}
              >
                {resolve.isPending ? "Resolving…" : "Confirm resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMarketRow({
  m,
  attendees,
  isResolving,
  onStartResolve,
  onCancelResolve,
  onPickOutcome,
}: {
  m: MarketDTO;
  attendees: { id: string; name: string }[];
  isResolving: boolean;
  onStartResolve: () => void;
  onCancelResolve: () => void;
  onPickOutcome: (optionId: string, label: string) => void;
}) {
  const total = m.aggregate.total;
  const isClosedUnresolved = m.status === "CLOSED";
  const isResolved = m.status === "RESOLVED";

  return (
    <div
      className="bg-white px-[14px] py-3"
      style={{ border: "1px solid var(--border)", borderRadius: 10 }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold mb-1 leading-[1.3]">{m.question}</div>
          <div className="flex gap-[6px] flex-wrap">
            <span
              className="text-[10px] font-mono text-fg3 bg-bg2 px-[6px] py-px rounded-xs2"
              style={{ letterSpacing: "0.05em" }}
            >
              {m.type === "YES_NO" ? "YES/NO" : "PICK"}
            </span>
            <span
              className="text-[10px] font-mono px-[6px] py-px rounded-xs2 uppercase"
              style={{
                background: "var(--bg2)",
                color:
                  m.status === "OPEN"
                    ? "var(--accent)"
                    : isResolved
                    ? "var(--fg2)"
                    : "var(--fg3)",
              }}
            >
              {m.status}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-fg3 font-mono whitespace-nowrap mt-px tabular">
          {total} vote{total === 1 ? "" : "s"}
        </span>
      </div>

      {isResolved && m.resolvedLabel && (
        <div className="mt-2 flex items-center gap-[6px]">
          <span className="text-accent text-[13px]">✓</span>
          <span className="text-[12px] text-fg2">
            Resolved: <strong>{m.resolvedLabel}</strong>
          </span>
        </div>
      )}

      {isClosedUnresolved && !isResolving && (
        <button
          type="button"
          onClick={onStartResolve}
          className="mt-3 px-[14px] py-[9px] text-[12px] font-bold cursor-pointer min-h-[40px]"
          style={{
            background: "var(--fg)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
          }}
        >
          Resolve market
        </button>
      )}

      {isClosedUnresolved && isResolving && (
        <div className="mt-3">
          <div className="text-[11px] text-fg3 mb-2">Pick the actual outcome:</div>
          <div className="flex flex-col gap-[6px]">
            {m.type === "YES_NO"
              ? (["yes", "no"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onPickOutcome(opt, opt.toUpperCase())}
                    className="px-3 py-[10px] text-[13px] font-semibold uppercase cursor-pointer min-h-[44px] text-center"
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {opt}
                  </button>
                ))
              : attendees.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onPickOutcome(a.id, a.name)}
                    className="px-3 py-[10px] text-[13px] cursor-pointer min-h-[44px] text-left"
                    style={{ border: "1px solid var(--border)", borderRadius: 8 }}
                  >
                    {a.name}
                  </button>
                ))}
            <button
              type="button"
              onClick={onCancelResolve}
              className="bg-transparent border-0 text-fg3 text-[12px] cursor-pointer p-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
