import { useStore } from "../hooks/useStore.js";
import { actions } from "../store/useAppStore.js";
import { useWorkflow } from "../hooks/useWorkflow.js";

export default function RightPanel() {
  const size = useStore((s) => s.modelSize) || [50, 45, 60];
  const rotation = useStore((s) => s.modelRotation) || 0;
  const { generate3DDirectly } = useWorkflow();
  const isLoading = useStore(s => s.isLoading);
  const currentImage = useStore(s => s.currentImage);

  // Emit a prompt event to the chat input to hit the Replicate API
  const applyParametricChange = (promptText) => {
    window.dispatchEvent(new CustomEvent("set-prompt", { detail: promptText }));
  };
  
  return (
    <aside className="w-[300px] h-full flex-shrink-0 glass rounded-3xl shadow-lg border border-surface-3 flex flex-col overflow-hidden transition-all duration-500">
      <div className="px-5 py-5 border-b border-surface-3 bg-gradient-to-bl from-surface-2 to-transparent">
        <h3 className="text-sm font-black flex items-center gap-2 tracking-tight">
          <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 w-6 h-6 rounded-md flex items-center justify-center shadow-sm">⚙️</span> 
          Smart Controls
        </h3>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 ml-8">Real-time parameters rendering</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7 custom-scrollbar text-sm">
        
        {/* Quick Action */}
        <div>
           <button
             onClick={generate3DDirectly}
             disabled={isLoading || !currentImage}
             className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
           >
              <span className="text-sm">⚡</span> Gen 3D (Skip AI Edit)
           </button>
        </div>

        {/* Transform / Size */}
        <div>
          <div className="flex items-center justify-between mb-4">
             <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">Dimensions</label>
             <button onClick={() => actions.setModelSize([50, 45, 60])} className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900 hover:bg-blue-100 transition-colors">Reset</button>
          </div>
          <div className="space-y-5 bg-surface-2/40 p-4 rounded-xl border border-surface-3">
            {['Width', 'Height', 'Depth'].map((dim, i) => (
              <div key={dim}>
                <div className="flex justify-between text-[11px] mb-2 font-bold">
                  <span className="text-slate-600 dark:text-slate-300">{dim}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-surface-3 px-2 py-0.5 border border-surface-3 rounded shadow-sm">{size[i]} cm</span>
                </div>
                <input type="range" min="10" max="250" value={size[i]} onChange={(e) => {
                  const newSize = [...size]; newSize[i] = parseInt(e.target.value); actions.setModelSize(newSize);
                }} className="w-full accent-blue-500 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="border-t border-surface-3 pt-6">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-4">Transform</label>
          <div className="bg-surface-2/40 p-4 rounded-xl border border-surface-3">
            <div className="flex justify-between text-[11px] mb-2 font-bold">
               <span className="text-slate-600 dark:text-slate-300">Rotation Y</span>
               <span className="text-purple-600 dark:text-purple-400 font-mono bg-white dark:bg-surface-3 px-2 py-0.5 border border-surface-3 rounded shadow-sm">{rotation}°</span>
            </div>
            <input type="range" min="-180" max="180" value={rotation} onChange={e => actions.setModelRotation(parseInt(e.target.value))} className="w-full accent-purple-500 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>

        {/* Materials */}
        <div className="border-t border-surface-3 pt-6">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-4">Material & Texture</label>
          <select 
            onChange={(e) => applyParametricChange(`change texture to ${e.target.value}`)}
            className="w-full bg-surface-1 border border-surface-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 appearance-none cursor-pointer transition-all hover:bg-surface-2"
          >
            <option value="">Select Material...</option>
            <option value="matte wood plywood">Matte Wood Plywood</option>
            <option value="polished walnut">Polished Walnut</option>
            <option value="brushed aluminum">Brushed Aluminum</option>
            <option value="soft velvet fabric">Soft Velvet Fabric</option>
            <option value="tempered glass">Tempered Glass</option>
            <option value="carbon fiber weave">Carbon Fiber Weave</option>
          </select>
          
          <label className="text-[10px] font-bold text-slate-400 block mb-2 px-1">Primary Color</label>
          <div className="flex gap-3 justify-center mb-1">
             <button onClick={() => applyParametricChange("change color to yellow")} className="relative group cursor-pointer border-none bg-transparent p-0">
                <div className="w-8 h-8 rounded-full bg-[#fcd34d] shadow-[0_4px_10px_rgba(252,211,77,0.4)] ring-2 ring-offset-2 ring-transparent group-hover:ring-yellow-400 transition-all hover:scale-110"></div>
             </button>
             <button onClick={() => applyParametricChange("change color to red")} className="relative group cursor-pointer border-none bg-transparent p-0">
                <div className="w-8 h-8 rounded-full bg-[#ef4444] shadow-[0_4px_10px_rgba(239,68,68,0.4)] ring-2 ring-offset-1 ring-transparent hover:ring-red-500 transition-all hover:scale-110"></div>
             </button>
             <button onClick={() => applyParametricChange("change color to blue")} className="relative group cursor-pointer border-none bg-transparent p-0">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6] shadow-[0_4px_10px_rgba(59,130,246,0.4)] ring-2 ring-offset-2 ring-transparent group-hover:ring-blue-500 transition-all hover:scale-110"></div>
             </button>
             <button onClick={() => applyParametricChange("change color to green")} className="relative group cursor-pointer border-none bg-transparent p-0">
                <div className="w-8 h-8 rounded-full bg-[#10b981] shadow-[0_4px_10px_rgba(16,185,129,0.4)] ring-2 ring-offset-2 ring-transparent group-hover:ring-green-500 transition-all hover:scale-110"></div>
             </button>
             <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-400 border border-slate-300 shadow-sm ring-2 ring-offset-2 ring-transparent group-hover:ring-gray-400 transition-all hover:scale-110 text-[10px] flex items-center justify-center font-bold text-slate-600"><span className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</span></div>
             </div>
          </div>
        </div>

        {/* Scene */}
        <div className="border-t border-surface-3 pt-6">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-4">Scene & Lighting</label>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
             <button onClick={() => applyParametricChange("add dramatic studio lighting")} className="bg-surface-1 border-2 border-surface-3 rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 transition-all shadow-sm">
                <span className="text-lg block mb-1">📸</span> Studio Light
             </button>
             <button onClick={() => applyParametricChange("add bright natural sunlight")} className="bg-blue-50 text-blue-600 border-2 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 rounded-xl p-3 cursor-pointer transition-all shadow-[0_4px_15px_-3px_rgba(59,130,246,0.2)]">
                <span className="text-lg block mb-1">☀️</span> Natural Sun
             </button>
             <button onClick={() => applyParametricChange("make it neon cyberpunk style with purple and cyan lighting")} className="bg-surface-1 border-2 border-surface-3 rounded-xl p-3 cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600 transition-all shadow-sm">
                <span className="text-lg block mb-1">👾</span> Neon Cyber
             </button>
             <button onClick={() => applyParametricChange("add soft ambient warm lighting")} className="bg-surface-1 border-2 border-surface-3 rounded-xl p-3 cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:text-yellow-600 transition-all shadow-sm">
                <span className="text-lg block mb-1">☁️</span> Soft Ambient
             </button>
          </div>
        </div>

      </div>
    </aside>
  )
}
