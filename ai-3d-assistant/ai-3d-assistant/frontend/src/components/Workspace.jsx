import { useState } from "react";
import { useStore } from "../hooks/useStore.js";
import { useWorkflow } from "../hooks/useWorkflow.js";
import ThreeViewer from "./ThreeViewer.jsx";
import ChatWindow from "./ChatWindow.jsx";
import ChatInput from "./ChatInput.jsx";

export default function Workspace() {
  const [viewMode, setViewMode] = useState("split"); // "2d", "3d", "split"
  const currentImage = useStore(s => s.currentImage);
  const editedImage = useStore((s) => s.currentEditedImage);
  const modelUrl = useStore(s => s.modelUrl);
  
  const { generate3DDirectly } = useWorkflow();
  const isLoading = useStore(s => s.isLoading);
  const currentImgUrl = editedImage || (currentImage ? currentImage.url : null);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-1 rounded-[24px] shadow-sm border border-surface-3 overflow-hidden relative glass-panel">
      {/* Top Toolbar */}
      <div className="h-14 border-b border-surface-3 flex justify-between items-center px-5 bg-surface-1/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1.5 bg-surface-2/60 p-1 rounded-xl border border-surface-3 shadow-inner">
          <button onClick={() => setViewMode("2d")} className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${viewMode==="2d" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-tertiary hover:text-primary"}`}>2D Blueprint</button>
          <button onClick={() => setViewMode("3d")} className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${viewMode==="3d" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-tertiary hover:text-primary"}`}>3D Viz</button>
          <button onClick={() => setViewMode("split")} className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${viewMode==="split" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-tertiary hover:text-primary"}`}>Split View</button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-[11px] font-extrabold text-blue-500 hover:text-blue-600 flex items-center gap-1.5 uppercase tracking-wide bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/40 shadow-sm hover:shadow-md transition-all">
            <span className="text-sm">✨</span> AI Auto-Layout
          </button>
          <button className="text-[11px] font-extrabold text-purple-500 hover:text-purple-600 flex items-center gap-1.5 uppercase tracking-wide bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/40 shadow-sm hover:shadow-md transition-all">
            <span className="text-sm">💡</span> Style Match
          </button>
        </div>
      </div>

      {/* Central Canvas Split Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2D Blueprint */}
        {(viewMode === "2d" || viewMode === "split") && (
          <div className={`flex-1 relative bg-surface-2 flex items-center justify-center overflow-hidden border-r border-surface-3`}>
            {/* Blueprint Grid Background inside inline style to handle color safely */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--bg-surface-3) 1px, transparent 1px), linear-gradient(90deg, var(--bg-surface-3) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            {currentImgUrl ? (
              <img src={currentImgUrl} className="max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.02]" alt="2D Blueprint" />
            ) : (
              <div className="flex flex-col items-center justify-center z-10 text-slate-400 opacity-60">
                <span className="text-6xl mb-4">📐</span>
                <p className="text-sm font-black tracking-tight text-secondary">Drop sketch to begin</p>
                <div className="text-[10px] uppercase tracking-widest mt-1 font-bold text-tertiary">2D Blueprint View</div>
              </div>
            )}
            
            {/* Viewport Label */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-surface-1/80 border border-surface-3 text-[10px] font-black tracking-widest uppercase rounded-lg text-tertiary backdrop-blur-md shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 2D Workspace
            </div>
            
            {/* Tools overlay for 2D */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
               <button className="w-8 h-8 rounded-lg bg-surface-1/90 border border-surface-3 shadow-sm flex items-center justify-center text-secondary hover:text-primary transition-colors tooltip cursor-brush" title="Draw Shape"><span className="text-lg">✏️</span></button>
               <button className="w-8 h-8 rounded-lg bg-surface-1/90 border border-surface-3 shadow-sm flex items-center justify-center text-secondary hover:text-primary transition-colors tooltip cursor-eraser" title="Eraser"><span className="text-lg">🧽</span></button>
               <button className="w-8 h-8 rounded-lg bg-surface-1/90 border border-surface-3 shadow-sm flex items-center justify-center text-secondary hover:text-primary transition-colors tooltip cursor-auto" title="Pan"><span className="text-lg">🤚</span></button>
            </div>
          </div>
        )}

        {/* 3D Visualization */}
        {(viewMode === "3d" || viewMode === "split") && (
          <div className="flex-1 relative bg-gradient-to-br from-surface to-surface-2 flex items-center justify-center overflow-hidden">
            {modelUrl ? (
               <div className="w-full h-full p-2">
                 <ThreeViewer imageUrl={currentImgUrl} modelUrl={modelUrl} />
               </div>
            ) : (
               <div className="w-full h-full p-6">
                  <div className="w-full h-full relative rounded-2xl border-2 border-dashed border-surface-3 flex flex-col items-center justify-center bg-surface-1/20 transition-colors hover:bg-surface-1/40">
                     <span className="text-5xl mb-4 opacity-50 grayscale rotate-12 transition-transform hover:rotate-0 duration-500">🛋️</span>
                     <span className="text-secondary font-bold uppercase tracking-widest text-[11px]">Immersive 3D Space</span>
                     <p className="text-[10px] text-tertiary max-w-[200px] text-center mt-2 opacity-80 mb-6">Rendered models will appear here with fully interactive 360° controls.</p>
                     
                     <button
                       onClick={generate3DDirectly}
                       disabled={isLoading || !currentImage}
                       className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed group border border-blue-400 dark:border-blue-500 overflow-hidden relative"
                     >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-0" />
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="text-lg">⚡</span> Generate 3D Directly
                        </span>
                     </button>
                  </div>
               </div>
            )}
            
            {/* Viewport Label */}
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-surface-1/80 border border-surface-3 text-[10px] font-black tracking-widest uppercase rounded-lg text-tertiary backdrop-blur-md shadow-sm flex items-center gap-2">
              3D Realtime  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            
            {/* Overlays for 3D navigation hints */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
               <button className="px-2 py-1 rounded-md bg-surface-1/80 border border-surface-3 text-[10px] font-bold text-secondary hover:text-primary transition-colors shadow-sm">Perspective</button>
               <button className="px-2 py-1 rounded-md bg-surface-1/80 border border-surface-3 text-[10px] font-bold text-secondary hover:text-primary transition-colors shadow-sm">Orthographic</button>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Drawer - elegantly integrated at the bottom of the workspace */}
      <div className="h-[240px] border-t border-surface-3 flex flex-col bg-surface-1/95 backdrop-blur-2xl shrink-0 transition-all">
         <div className="flex justify-between items-center px-5 py-2.5 border-b border-surface-3 bg-surface-2/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest font-black text-primary">AI Design Assistant</span>
            </div>
            <div className="flex gap-2">
               <span className="text-[10px] text-tertiary font-bold bg-surface-2 px-2 py-0.5 rounded-md border border-surface-3">Auto-Save On</span>
            </div>
         </div>
         <div className="flex-1 flex overflow-hidden">
            <ChatWindow />
         </div>
         <div className="px-4 py-3 border-t border-surface-3 bg-surface-1">
            <ChatInput />
         </div>
      </div>
    </div>
  )
}
