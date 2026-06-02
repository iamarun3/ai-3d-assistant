/**
 * components/ChatMessage.jsx
 * Renders a single chat message bubble.
 * Supports: text, image preview, edited-image preview, 3D viewer, progress bar.
 */

import { lazy, Suspense } from "react";
import ProgressBar from "./ProgressBar.jsx";

// Lazy-load the 3D viewer to avoid importing Three.js until needed
const ThreeViewer = lazy(() => import("./ThreeViewer.jsx"));

/**
 * @param {{ msg: object, onDownload: (msg: object) => void }} props
 */
export default function ChatMessage({ msg, onDownload }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex gap-3 mb-5 items-start animate-slide-in ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* ── Avatar ──────────────────────────────────────────── */}
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[15px] border"
        style={{
          background: isUser
            ? "linear-gradient(135deg,#7c3aed,#2563eb)"
            : "linear-gradient(135deg,#0f766e,#065f46)",
          borderColor: isUser ? "#7c3aed" : "#0f766e",
        }}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      {/* ── Message content ──────────────────────────────────── */}
      <div
        className={`max-w-[82%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Text bubble */}
        {msg.text && (
          <div
            className={`px-4 py-3 text-[15px] font-medium leading-relaxed whitespace-pre-line shadow-sm border ${
              isUser
                ? "bg-black border-black text-white dark:bg-blue-600 dark:border-blue-500"
                : "bg-white dark:bg-surface-2 text-slate-300 dark:text-slate-100 border-surface-3"
            }`}
            style={{
              borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            }}
          >
            {msg.text}
          </div>
        )}

        {/* Uploaded image preview (no edited version yet) */}
        {msg.imageUrl && !msg.editedImageUrl && (
          <div className="rounded-xl overflow-hidden border border-surface-3 max-w-[280px] mt-1 relative group">
            <img src={msg.imageUrl} alt="uploaded" className="w-full block" />
            <button
              onClick={() => onDownload?.(msg.imageUrl, `uploaded_${msg.id}.jpg`)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
              title="Download Image"
            >
              ⬇️
            </button>
          </div>
        )}

        {/* Edited image result */}
        {msg.editedImageUrl && (
          <div className="rounded-xl overflow-hidden border border-blue-500/25 max-w-[280px] mt-1 relative group">
            <div className="px-3 py-1.5 bg-blue-600/15 border-b border-blue-500/20 text-blue-400 text-[10px] font-mono flex items-center justify-between">
              <span>✏️ Edited Result</span>
              <button
                onClick={() => onDownload?.(msg.editedImageUrl, `edited_${msg.id}.jpg`)}
                title="Download Edited Image"
                className="hover:text-white transition-colors"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ⬇️
              </button>
            </div>
            <img src={msg.editedImageUrl} alt="edited" className="w-full block" />
          </div>
        )}

        {/* Progress bar */}
        {msg.step && msg.step !== "complete" && (
          <ProgressBar step={msg.step} />
        )}

        {/* 3D Viewer */}
        {msg.show3D && (
          <div className="mt-1" style={{ width: "min(420px, 100%)", height: "380px" }}>
            <Suspense
              fallback={
                <div className="w-full h-[340px] rounded-2xl bg-surface-2 border border-surface-3 flex items-center justify-center text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-surface-3 border-t-blue-500 rounded-full animate-[spin_.7s_linear_infinite]" />
                    Loading 3D viewer…
                  </div>
                </div>
              }
            >
              <ThreeViewer
                imageUrl={msg.editedImageUrl || msg.imageUrl}
                modelUrl={msg.modelUrl}
              />
            </Suspense>

            {/* Download button */}
            <button
              onClick={() => onDownload?.(msg.modelUrl, `model_${msg.id}.glb`)}
              className="mt-2 w-full py-2.5 rounded-xl border border-blue-500/30 bg-blue-600/10 text-accent-cyan text-xs font-mono transition-colors hover:bg-blue-600/22"
            >
              ⬇ Download 3D Model (.glb)
            </button>
          </div>
        )}

        {/* Timestamp */}
        <time className="text-[10px] text-slate-300 font-bold font-mono">
          {new Date(msg.ts).toLocaleTimeString()}
        </time>
      </div>
    </div>
  );
}
