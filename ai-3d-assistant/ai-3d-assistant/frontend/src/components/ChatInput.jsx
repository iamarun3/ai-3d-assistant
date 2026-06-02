/**
 * components/ChatInput.jsx
 * The bottom input bar: quick prompts, image upload button,
 * mask toggle, textarea, and send button.
 */

import { useRef, useState, useEffect } from "react";
import { actions } from "../store/useAppStore.js";
import { useStore } from "../hooks/useStore.js";
import { useWorkflow } from "../hooks/useWorkflow.js";
import { QUICK_PROMPTS } from "../utils/config.js";

export default function ChatInput() {
  const [text,   setText]   = useState("");
  const fileRef             = useRef(null);
  const textareaRef         = useRef(null);

  const isLoading    = useStore((s) => s.isLoading);
  const currentImage = useStore((s) => s.currentImage);
  const currentMask  = useStore((s) => s.currentMask);

  const { uploadImage, runPipeline } = useWorkflow();

  // Listen for history-click events from Sidebar
  useEffect(() => {
    const handler = (e) => {
      setText(e.detail);
      textareaRef.current?.focus();
    };
    window.addEventListener("set-prompt", handler);
    return () => window.removeEventListener("set-prompt", handler);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) await uploadImage(file);
    e.target.value = "";
  };

  const submit = async () => {
    if (!text.trim() || isLoading) return;
    const p = text;
    setText("");
    await runPipeline(p);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
  };

  const canSend = !!text.trim() && !isLoading && !!currentImage;

  return (
    <div className="px-6 py-5 rounded-3xl border border-white/40 dark:border-surface-3 glass shadow-2xl mb-4 relative z-50">
      {/* Quick prompts */}
      <div className="flex flex-wrap gap-1.5 mb-2 px-1">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => { setText(p); textareaRef.current?.focus(); }}
            className="px-2.5 py-1 rounded-lg border border-slate-400 bg-white text-black text-[11px] font-bold transition-all hover:bg-black hover:border-black hover:text-white shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-100 dark:hover:text-black"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        {/* Upload */}
        <label
          title="Upload Image"
          className="flex-shrink-0 w-[44px] h-[44px] rounded-xl border-2 border-dashed border-surface-3 bg-surface-2 flex items-center justify-center text-tertiary font-black cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 shadow-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {/* Mask toggle */}
        {currentImage && (
          <button
            onClick={() => actions.openMaskEditor()}
            title="Open Mask Editor"
            className="flex-shrink-0 w-[44px] h-[44px] rounded-xl border-2 flex items-center justify-center transition-all shadow-sm"
            style={{
              borderColor: currentMask ? "#2563eb" : "#cbd5e1",
              background:  currentMask ? "#2563eb" : "#ffffff",
              color:       currentMask ? "#ffffff" : "#475569",
            }}
          >
            <span className="text-lg">🎭</span>
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          placeholder={
            currentImage
              ? "Tell me what to edit... (Enter to send, Shift+Enter for new line)"
              : "Describe an image or upload one to get started..."
          }
          rows={1}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-surface-3 bg-surface font-bold resize-none leading-relaxed transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-sm placeholder:text-tertiary text-primary dark:border-surface-3 dark:bg-surface-2"
          style={{ 
            minHeight: "44px", 
            maxHeight: "120px", 
            opacity: isLoading ? 0.5 : 1, 
            color: "var(--text-primary)",
            fontSize: "15px"
          }}
        />

        {/* Send */}
        <button
          onClick={submit}
          disabled={!canSend}
          className={`flex-shrink-0 w-[44px] h-[44px] rounded-xl flex items-center justify-center text-white transition-all flex-col ${
            canSend 
              ? "bg-primary hover:scale-105 cursor-pointer shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]" 
              : "bg-surface-3 text-secondary cursor-not-allowed border border-surface-3"
          }`}
        >
          {isLoading ? (
            <div
              className="w-4 h-4 border-2 border-white/30 rounded-full"
              style={{ borderTopColor: "white", animation: "spin .7s linear infinite" }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          )}
        </button>
      </div>
    </div>
  );
}
