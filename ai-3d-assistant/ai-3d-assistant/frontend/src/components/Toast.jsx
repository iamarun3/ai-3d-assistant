/**
 * components/Toast.jsx
 * Sleek slide-in toast notification system.
 * Usage: toastEmit({ message, type: 'success' | 'error' | 'info' | 'warning' })
 */

import { useState, useEffect, useCallback } from "react";

// --- Global event bus (no React dependency needed) ---
const listeners = new Set();

export function toastEmit({ message, type = "info", duration = 3500 }) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  listeners.forEach((fn) => fn({ id, message, type, duration }));
}

const ICONS = {
  success: "✅",
  error:   "❌",
  warning: "⚠️",
  info:    "ℹ️",
};

const COLORS = {
  success: "border-green-500/40 bg-green-50/90 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  error:   "border-red-500/40   bg-red-50/90   dark:bg-red-900/30   text-red-800   dark:text-red-300",
  warning: "border-yellow-500/40 bg-yellow-50/90 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  info:    "border-blue-500/40  bg-blue-50/90  dark:bg-blue-900/30  text-blue-800  dark:text-blue-300",
};

const BAR_COLORS = {
  success: "bg-green-500",
  error:   "bg-red-500",
  warning: "bg-yellow-500",
  info:    "bg-blue-500",
};

function ToastItem({ id, message, type, duration, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Progress bar countdown
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 16);
    // Auto-dismiss
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 350);
    }, duration);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, [id, duration, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-lg overflow-hidden max-w-sm w-full transition-all duration-350 ${COLORS[type]} ${
        visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95"
      }`}
      style={{ transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[type]}</span>
      <p className="text-[13px] font-semibold leading-snug flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 350); }}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-xs mt-0.5"
      >✕</button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] ${BAR_COLORS[type]} transition-all`}
        style={{ width: progress + "%", transition: "width 0.016s linear" }}
      />
    </div>
  );
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev.slice(-4), toast]); // max 5 toasts
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
