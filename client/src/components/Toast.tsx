import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastItem = { id: number; msg: string; gone: boolean };

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, gone: false }]);
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, gone: true } : x)));
    }, 2800);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`bg-fg text-bg px-[18px] py-[10px] rounded-[10px] text-[13px] font-medium whitespace-nowrap ${
              t.gone ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

// Auto-dismiss helper for non-context use.
export function useAutoDismiss(onDone: () => void, ms = 3200) {
  useEffect(() => {
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [onDone, ms]);
}
