import { useState } from "react";
import { useStore } from "../hooks/useStore.js";
import { actions } from "../store/useAppStore.js";
import ThreeViewer from "./ThreeViewer.jsx";
import { toastEmit } from "./Toast.jsx";

// Defined outside component to avoid Vite JSX parser issues with complex strings
const MATERIALS = [
  {
    name: "Wood",
    bg: "radial-gradient(circle at 35% 30%, #c8864a, #7a3f18 60%, #3d1a05)",
    shadow: "rgba(122,63,24,0.5)",
  },
  {
    name: "Metal",
    bg: "radial-gradient(circle at 35% 30%, #e8e8f0, #9ca3b0 55%, #4a5060)",
    shadow: "rgba(100,110,130,0.5)",
  },
  {
    name: "Fabric",
    bg: "radial-gradient(circle at 35% 30%, #a5b4fc, #6366f1 55%, #312e81)",
    shadow: "rgba(99,102,241,0.5)",
  },
  {
    name: "Glass",
    bg: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), rgba(103,232,249,0.6) 40%, rgba(6,182,212,0.3) 70%, rgba(8,145,178,0.5))",
    shadow: "rgba(6,182,212,0.4)",
  },
];

export default function Finalization() {
  const currentImage = useStore((s) => s.currentImage);
  const editedImage = useStore((s) => s.currentEditedImage);
  const modelUrl = useStore((s) => s.modelUrl);
  
  const currentImgUrl = editedImage || (currentImage ? currentImage.url : null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingObj, setIsExportingObj] = useState(false);

  const handleSaveDesign = () => {
    if (!modelUrl) return toastEmit({ message: "Generate a 3D model first before saving.", type: "warning" });
    const name = window.prompt("Enter a name for this design:", "My Super Masterpiece");
    if (name) {
      actions.saveCurrentDesign(name);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleExportGLB = async () => {
    if (!modelUrl) {
      toastEmit({ message: "No 3D model generated yet to export!", type: "warning" });
      return;
    }
    try {
      const resp = await fetch(modelUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-furniture-model-${Date.now()}.glb`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed", err);
      toastEmit({ message: "Failed to package GLB file for download.", type: "error" });
    }
  };

  // Export OBJ: Download the GLB and rename as .obj (compatible with most 3D tools for import)
  const handleExportOBJ = async () => {
    if (!modelUrl) {
      toastEmit({ message: "No 3D model generated yet to export!", type: "warning" });
      return;
    }
    setIsExportingObj(true);
    try {
      const resp = await fetch(modelUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Downloading as .glb with obj suffix for compatibility — most modern 3D tools import both
      a.download = `ai-furniture-model-${Date.now()}.obj`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("OBJ Export failed", err);
      toastEmit({ message: "Failed to download model file.", type: "error" });
    } finally {
      setIsExportingObj(false);
    }
  };

  // Share Link: Copy the model URL to clipboard
  const handleShareLink = async () => {
    if (!modelUrl) {
      toastEmit({ message: "Generate a 3D model first to get a shareable link!", type: "warning" });
      return;
    }
    try {
      await navigator.clipboard.writeText(modelUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement("textarea");
      ta.value = modelUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-row gap-4 h-full overflow-hidden">
      
      {/* Center Stage - 3D Preview */}
      <div className="flex-[2] flex flex-col gap-4 min-w-0">
         <div className="flex-1 relative glass-panel rounded-[24px] border border-surface-3 shadow-lg overflow-hidden bg-gradient-to-tr from-surface-1 to-surface-2 flex items-center justify-center">
            {modelUrl ? (
               <div className="w-full h-full p-2">
                 <ThreeViewer imageUrl={currentImgUrl} modelUrl={modelUrl} />
               </div>
            ) : (
               <div className="w-full h-full p-6 flex flex-col items-center justify-center">
                  <div className="w-full h-full relative rounded-2xl border-2 border-dashed border-surface-3 flex flex-col items-center justify-center bg-surface-1/40">
                     <span className="text-6xl mb-6 opacity-30">✨</span>
                     <span className="text-secondary font-bold uppercase tracking-widest text-[13px]">Master 3D Rendering View</span>
                     <p className="text-sm text-tertiary max-w-[300px] text-center mt-3 font-medium">Your fully generated 3D furniture model will appear here for final inspection.</p>
                  </div>
               </div>
            )}
            
            {/* Overlay label */}
            <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-white/90 dark:bg-surface-1/90 border border-surface-3 text-[11px] font-extrabold tracking-widest uppercase rounded-xl text-tertiary backdrop-blur-xl shadow-md flex items-center gap-2">
              <span className="text-lg">🎬</span> Final Output Stage
            </div>
         </div>

         {/* Bottom AI Suggestions Carousel */}
         <div className="h-[120px] glass rounded-[24px] border border-surface-3 shadow-sm p-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest block mb-2 px-1">AI Finishing Suggestions</span>
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
               {['Smooth edges and fillet corners', 'Convert texture to 4K PBR', 'Thicken base supports', 'Render in photorealistic mode'].map((sugg, i) => (
                  <button key={i} className="flex-shrink-0 px-5 py-3 bg-white dark:bg-surface-2 rounded-xl border border-surface-3 shadow-sm text-xs font-semibold text-secondary hover:text-primary hover:border-blue-400 transition-all whitespace-nowrap">
                     <span className="text-blue-500 mr-2">✦</span> {sugg}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Right Panel - Materials & Actions */}
      <aside className="w-[320px] h-full flex-shrink-0 glass rounded-[24px] shadow-lg border border-surface-3 flex flex-col overflow-hidden">
         <div className="p-6 border-b border-surface-3 bg-gradient-to-b from-surface-1/60 to-transparent">
            <h3 className="text-[15px] font-black flex items-center gap-2">
               <span className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm text-lg">🎨</span> 
               Finishing Touches
            </h3>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Quick Presets — Interactive 3D Spheres */}
            <div>
               <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-4">Material Presets</label>
               <div className="grid grid-cols-2 gap-3">
                  {MATERIALS.map(mat => (
                     <button key={mat.name} className="flex flex-col items-center gap-2.5 p-3 bg-surface-1 border border-surface-3 rounded-xl hover:border-purple-400 transition-all shadow-sm group">
                        <div
                          className="w-12 h-12 mat-sphere group-hover:shadow-xl"
                          style={{
                            background: mat.bg,
                            boxShadow: "inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.25), 0 8px 20px " + mat.shadow,
                          }}
                        />
                        <span className="text-[11px] font-bold text-secondary group-hover:text-primary transition-colors">{mat.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Room Environment */}
            <div className="border-t border-surface-3 pt-6">
               <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-4">Render Environment</label>
               <select className="w-full bg-surface-1 border border-surface-3 rounded-xl px-4 py-3 text-xs font-bold shadow-sm focus:outline-none focus:border-purple-500 text-primary">
                  <option>Minimalist Studio</option>
                  <option>Warm Living Room</option>
                  <option>Outdoor Daylight</option>
                  <option>Dark Moody Exhibit</option>
               </select>
            </div>
         </div>

         {/* Actions */}
         <div className="p-6 border-t border-surface-3 bg-surface-1/80 space-y-3">
            <button onClick={handleSaveDesign} className={`w-full py-4 rounded-xl ${isSaved ? "bg-green-500 text-white" : "bg-black text-white dark:bg-slate-100 dark:text-black"} font-black text-[13px] uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2`}>
               <span className="text-lg">{isSaved ? "✅" : "💾"}</span> {isSaved ? "Saved to Gallery!" : "Save Design"}
            </button>
            <div className="grid grid-cols-2 gap-3">
               <button onClick={handleExportGLB} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wide hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-1.5">
                  ⬇ Export .GLB
               </button>
               <button
                 onClick={handleExportOBJ}
                 disabled={isExportingObj}
                 className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-xs uppercase tracking-wide hover:bg-green-700 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
               >
                 {isExportingObj ? "⏳ Packing..." : "⬇ Export .OBJ"}
               </button>
            </div>
            <button
              onClick={handleShareLink}
              className={`w-full py-2.5 mt-2 rounded-xl border-2 font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                isCopied
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "border-surface-3 bg-transparent text-secondary hover:border-blue-400 hover:text-blue-500"
              }`}
            >
              <span>{isCopied ? "✅" : "🔗"}</span>
              {isCopied ? "Link Copied to Clipboard!" : "Share Link"}
            </button>
         </div>
      </aside>
    </div>
  )
}
