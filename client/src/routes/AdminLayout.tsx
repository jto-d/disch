import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { useAdminSession } from "../lib/hooks";

export function AdminLayout() {
  const session = useAdminSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session.isFetched && !session.data?.admin) {
      navigate("/admin", { replace: true });
    }
  }, [session.isFetched, session.data, navigate]);

  if (!session.data?.admin) {
    return <div className="min-h-[100dvh]" />;
  }

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex-1 py-[11px] text-[12px] cursor-pointer transition-all duration-150 capitalize tracking-[0.03em] text-center",
      isActive ? "text-fg font-bold" : "text-fg3 font-normal",
    ].join(" ");

  return (
    <div className="animate-fade-in min-h-[100dvh] flex flex-col bg-bg">
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

      <div className="flex bg-white shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <NavLink
          to="/admin/markets"
          className={tabClass}
          style={({ isActive }) => ({
            borderBottom: `2px solid ${isActive ? "var(--fg)" : "transparent"}`,
          })}
        >
          Markets
        </NavLink>
        <NavLink
          to="/admin/attendees"
          className={tabClass}
          style={({ isActive }) => ({
            borderBottom: `2px solid ${isActive ? "var(--fg)" : "transparent"}`,
          })}
        >
          Attendees
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
    </div>
  );
}
