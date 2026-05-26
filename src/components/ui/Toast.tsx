"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Toast Container UI ────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const STYLES: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: {
    bg: "rgba(0,255,148,0.07)",
    border: "rgba(0,255,148,0.35)",
    icon: "#00ff94",
  },
  error: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.4)",
    icon: "#f87171",
  },
  warning: {
    bg: "rgba(255,107,0,0.08)",
    border: "rgba(255,107,0,0.4)",
    icon: "#fb923c",
  },
  info: {
    bg: "rgba(0,212,255,0.07)",
    border: "rgba(0,212,255,0.3)",
    icon: "#00d4ff",
  },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const s = STYLES[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md animate-slide-up"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: "#e2e8f0",
            }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ background: s.border, color: s.icon }}
            >
              {ICONS[t.type]}
            </span>
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-[#475569] hover:text-[#94a3b8] transition-colors text-lg leading-none"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
