/**
 * components/Header.jsx
 * Top bar: hamburger menu, title, mode indicator, loading spinner.
 */

import { actions } from "../store/useAppStore.js";
import { useStore } from "../hooks/useStore.js";

export default function Header() {
  const isLoading = useStore((s) => s.isLoading);
  const apiMode   = useStore((s) => s.apiMode);

  return (
    <header className="px-7 py-4 glass rounded-full shadow-2xl flex items-center gap-5 transition-all hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] border border-white/60 dark:border-surface-3">

      {/* Title */}
      <div className="flex-1 min-w-[200px]">
        <h1 className="font-sans text-[15px] font-black text-primary tracking-tight">
          AI 2D → 3D Design Assistant
        </h1>
        <p className="text-[11px] text-tertiary font-bold tracking-wide mt-0.5">
          {apiMode === "demo"
            ? "🟡 Demo Mode Active"
            : "🟢 Live API Mode"}
        </p>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => actions.toggleTheme()}
        className="w-10 h-10 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center text-secondary hover:text-primary hover:border-accent-blue hover:shadow-lg transition-all"
        title="Toggle Theme"
      >
        {useStore((s) => s.theme) === "light" ? "🌙" : "☀️"}
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-accent-cyan text-xs font-semibold px-2">
          <div
            className="w-4 h-4 border-[2px] border-surface-3 rounded-full"
            style={{ borderTopColor: "var(--accent-blue)", animation: "spin .7s linear infinite" }}
          />
          <span className="animate-pulse">Processing…</span>
        </div>
      )}
    </header>
  );
}
