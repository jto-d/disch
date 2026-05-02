import { Outlet } from "react-router-dom";
import { ToastProvider } from "../components/Toast";

export function Root() {
  return (
    <ToastProvider>
      <div className="mobile-shell">
        <Outlet />
      </div>
    </ToastProvider>
  );
}
