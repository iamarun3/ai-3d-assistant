/**
 * components/ProgressBar.jsx
 * Premium animated waveform pipeline indicator shown inside bot messages.
 */

import { PROGRESS_STEPS } from "../utils/config.js";

/**
 * @param {{ step: string }} props  - Current active step ID
 */
export default function ProgressBar({ step }) {
  const idx = PROGRESS_STEPS.findIndex((s) => s.id === step);
  const current = Math.max(0, Math.min(idx, PROGRESS_STEPS.length - 1));
  const currentStep = PROGRESS_STEPS[current];

  return (
    <div className="px-4 py-3 bg-surface-2 rounded-2xl border border-surface-3 my-1 space-y-3">

      {/* Waveform visualizer + label row */}
      <div className="flex items-center gap-3">
        {/* Animated waveform bars */}
        <div className="flex items-end gap-[3px] h-5 text-blue-500 flex-shrink-0">
          <span className="wave-bar h-2" />
          <span className="wave-bar h-4" />
          <span className="wave-bar h-5" />
          <span className="wave-bar h-3" />
          <span className="wave-bar h-5" />
        </div>

        {/* Typing step text */}
        <span className="text-[12px] font-semibold text-blue-500 typing-cursor flex-1 truncate">
          {currentStep.label}
        </span>

        {/* Step counter badge */}
        <span className="text-[10px] font-bold text-tertiary bg-surface-3/70 px-2 py-0.5 rounded-full flex-shrink-0">
          {current + 1}/{PROGRESS_STEPS.length}
        </span>
      </div>

      {/* Step dots progress rail */}
      <div className="flex items-center gap-1.5">
        {PROGRESS_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5 flex-1 last:flex-none">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-all duration-500"
              style={{
                background:
                  i < idx
                    ? "linear-gradient(135deg,#1d4ed8,#6d28d9)"
                    : i === idx
                    ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                    : "var(--bg-surface-3)",
                boxShadow: i === idx ? "0 0 12px rgba(96,165,250,.5)" : "none",
                transform: i === idx ? "scale(1.2)" : "scale(1)",
              }}
            >
              {i < idx ? "✓" : s.icon}
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 rounded-full transition-all duration-700"
                style={{ background: i < idx ? "#2563eb" : "var(--bg-surface-3)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
