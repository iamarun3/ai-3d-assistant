import { useRef, useState, useCallback } from "react";
import { actions } from "../store/useAppStore.js";
import { useStore } from "../hooks/useStore.js";
import { useWorkflow } from "../hooks/useWorkflow.js";
import { toastEmit } from "./Toast.jsx";
import ChatInput from "./ChatInput.jsx";

export default function Dashboard() {
  const fileRef = useRef(null);
  const { uploadImage } = useWorkflow();
  const recentDesigns = useStore((s) => s.recentDesigns);

  // Drag & Drop state
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastEmit({ message: "Please upload an image file (PNG or JPG).", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastEmit({ message: "File too large. Maximum 5MB allowed.", type: "warning" });
      return;
    }
    toastEmit({ message: "Image uploaded! Taking you to the workspace…", type: "success" });
    await uploadImage(file);
    actions.setCurrentView("editor");
  };

  const handleInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = "";
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* ── Animated mesh-gradient background ── */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none z-0" />

      {/* Floating blurred orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl orb pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl orb-2 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-10 w-48 h-48 rounded-full bg-cyan-400/8 blur-2xl orb-3 pointer-events-none z-0" />

      {/* ── Full-screen Drag & Drop overlay ── */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-400 rounded-[28px] animate-pulse" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.6)] animate-bounce">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-blue-600 dark:text-blue-300 font-black text-2xl tracking-tight">Drop it here!</p>
            <p className="text-blue-500/70 text-sm font-semibold">Release to upload your image</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10 relative z-10">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 animate-float">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI-Powered 3D Design Studio
          </div>
          <h1 className="text-5xl font-black tracking-tight text-primary mb-4 drop-shadow-md">
            Welcome to 3D studio, <span className="gradient-text">Designer.</span>
          </h1>
          <p className="text-secondary font-medium text-lg max-w-2xl">
            Upload a sketch or image, and let AI parametrically generate, edit, and visualize a stunning 3D model in real time.
          </p>
        </div>

        {/* Upload Area */}
        <div className="w-full">
          <label
            className={`w-full relative group cursor-pointer flex flex-col items-center justify-center p-16 rounded-[32px] border-2 border-dashed glass overflow-hidden transition-all duration-[600ms]
              ${isDragging
                ? "border-blue-500 bg-blue-50/40 shadow-[0_0_80px_rgba(59,130,246,0.2)] -translate-y-1"
                : "border-surface-3 hover:bg-blue-50/30 dark:hover:bg-surface-2 hover:border-blue-400 hover:shadow-[0_0_60px_rgba(59,130,246,0.12)] hover:-translate-y-1"
              }`}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-0" />

            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm transition-all duration-500 z-10
              ${isDragging
                ? "bg-blue-600 text-white scale-110 shadow-[0_10px_30px_rgba(37,99,235,0.5)]"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
              }`}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform duration-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-primary mb-2">Drag and drop your sketch</h3>
            <p className="text-sm text-tertiary font-medium mb-6">Or click to browse from your computer (PNG, JPG files up to 5MB)</p>
            <div className="px-8 py-3 bg-blue-600 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] rounded-xl font-bold text-sm tracking-wide group-hover:bg-blue-700 transition-colors">
              Upload Image / Sketch
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
          </label>
        </div>

        {/* Recent Designs */}
        <div>
          <h3 className="text-sm font-black text-tertiary uppercase tracking-widest mb-6">Recent Designs</h3>
          {recentDesigns.length === 0 ? (
            <div className="w-full glass-panel rounded-2xl p-8 border border-surface-3 flex flex-col items-center justify-center text-center opacity-80">
              <span className="text-4xl mb-3 animate-float">🖼️</span>
              <h4 className="text-primary font-bold mb-1">No designs saved yet</h4>
              <p className="text-sm text-tertiary">Proceed to the Workspace to generate and save your first 3D model.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentDesigns.map((design) => (
                <div
                  key={design.id}
                  onClick={() => {
                    actions.loadDesign(design.id);
                    toastEmit({ message: `Loaded "${design.name}"`, type: "success" });
                  }}
                  className="group glass-panel rounded-2xl p-4 border border-surface-3 hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="w-full aspect-[4/3] rounded-xl bg-surface-2 mb-4 overflow-hidden relative group-hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                    {design.image && (
                      <img src={design.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt={design.name} />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.deleteDesign(design.id);
                          toastEmit({ message: "Design deleted", type: "success" });
                        }}
                        className="bg-red-500/80 hover:bg-red-600 text-white w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-sm shadow-sm transition-all"
                        title="Delete Design"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="bg-white/90 dark:bg-surface-1/90 px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-sm border border-slate-200 dark:border-surface-3">3D Model</div>
                    </div>
                  </div>
                  <h4 className="font-black text-primary text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">{design.name}</h4>
                  <p className="text-xs text-blue-500 font-bold tracking-wide">{new Date(design.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat/AI Input */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-8 flex-shrink-0 mt-auto relative z-10">
        <ChatInput />
      </div>
    </div>
  );
}
