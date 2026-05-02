import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { useAdminAuth, useAdminSession } from "../lib/hooks";
import { useToast } from "../components/Toast";

export function AdminGate() {
  const navigate = useNavigate();
  const session = useAdminSession();
  const auth = useAdminAuth();
  const toast = useToast();
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (session.data?.admin) {
      navigate("/admin/markets", { replace: true });
    }
  }, [session.data, navigate]);

  const submit = () => {
    if (!pw || auth.isPending) return;
    auth.mutate(pw, {
      onSuccess: () => navigate("/admin/markets", { replace: true }),
      onError: (e: any) => toast(e?.message ?? "Wrong password"),
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <div
        className="bg-white px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <BackButton onClick={() => navigate("/feed")} />
        <div>
          <div className="text-[14px] font-bold tracking-[-0.01em]">Admin</div>
          <div className="text-[11px] text-fg3 font-mono">Disch Market</div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-12">
        <div className="text-[11px] font-bold tracking-[0.2em] text-fg3 font-mono mb-3">
          HOST GATE
        </div>
        <div className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] mb-2">
          Sign in to run<br />the show.
        </div>
        <div className="text-[13px] text-fg3 mb-8 leading-[1.5]">
          Hosts only. Use the admin password.
        </div>

        <label className="text-[12px] font-semibold text-fg2 tracking-[0.05em] block mb-2">
          PASSWORD
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••••••"
          autoFocus
          className="w-full px-4 py-[14px] text-[16px] font-medium bg-white text-fg outline-none transition-[border-color] mb-3"
          style={{ border: "1px solid var(--border)", borderRadius: 12 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fg)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!pw || auth.isPending}
          className="w-full py-[15px] text-[15px] font-bold transition-all duration-150 min-h-[44px]"
          style={{
            background: pw ? "var(--fg)" : "var(--border)",
            color: pw ? "var(--bg)" : "var(--fg3)",
            border: "none",
            borderRadius: 12,
            cursor: pw ? "pointer" : "not-allowed",
          }}
        >
          {auth.isPending ? "Checking…" : "Unlock admin →"}
        </button>
      </div>
    </div>
  );
}
