import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVoter, useMe } from "../lib/hooks";

export function EntryRoute() {
  const me = useMe();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const create = useCreateVoter();

  // Already onboarded? Skip straight to feed.
  useEffect(() => {
    if (me.isSuccess && me.data?.id) {
      navigate("/feed", { replace: true });
    }
  }, [me.isSuccess, me.data, navigate]);

  const submit = () => {
    const n = name.trim();
    if (!n || create.isPending) return;
    create.mutate(n, {
      onSuccess: (v) => {
        try {
          localStorage.setItem("disch.voter.name", v.name);
        } catch {}
        navigate("/feed", { replace: true });
      },
    });
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col justify-between px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="pt-20">
        <div className="text-[11px] font-bold tracking-[0.2em] text-fg3 font-mono mb-3">
          DISCH MARKET
        </div>
        <div className="text-display text-fg mb-[6px]">
          Crowd wisdom
          <br />
          for who's
          <br />
          sending it.
        </div>
        <div className="text-[14px] text-fg3 leading-[1.5] mt-3">
          Prediction markets for the Disch.
          <br />
          Vote on what's about to happen.
        </div>
      </div>

      <div className="pb-12">
        <div className="mb-3">
          <label className="text-[12px] font-semibold text-fg2 tracking-[0.05em] block mb-2">
            WHAT'S YOUR NAME?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter your name…"
            autoFocus
            maxLength={40}
            className="w-full px-4 py-[14px] text-[16px] font-medium bg-white text-fg outline-none transition-[border-color]"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fg)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || create.isPending}
          className="w-full py-[15px] text-[15px] font-bold transition-all duration-150 min-h-[44px]"
          style={{
            background: name.trim() ? "var(--fg)" : "var(--border)",
            color: name.trim() ? "var(--bg)" : "var(--fg3)",
            border: "none",
            borderRadius: 12,
            cursor: name.trim() ? "pointer" : "not-allowed",
            letterSpacing: "0.01em",
            marginBottom: 14,
          }}
        >
          {create.isPending ? "Entering…" : "Enter the market →"}
        </button>
        <div className="text-center text-[11px] text-fg3 leading-[1.5]">
          One vote per market. No takebacks.
        </div>
      </div>
    </div>
  );
}
