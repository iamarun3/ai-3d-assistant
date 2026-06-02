import { useRef } from "react";
import { actions } from "../store/useAppStore.js";
import { useStore } from "../hooks/useStore.js";

export default function Sidebar() {
  const currentView    = useStore((s) => s.currentView);
  const currentImage   = useStore((s) => s.currentImage);
  const apiMode        = useStore((s) => s.apiMode);
  const recentDesigns  = useStore((s) => s.recentDesigns);

  const navItems = [
    { id: "dashboard",     icon: "🏠", label: "Dashboard",       always: true },
    { id: "editor",        icon: "📐", label: "2D→3D Workspace", always: false },
    { id: "finalization",  icon: "✨", label: "Finalization",    always: false },
  ];

  return (
    <aside className="w-[280px] h-full flex-shrink-0 glass rounded-[24px] shadow-lg border border-surface-3 flex flex-col overflow-hidden transition-all duration-500">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-6 py-6 border-b border-surface-3 bg-gradient-to-br from-surface-1 to-surface-2">
        <h2 className="text-[17px] font-black tracking-tight text-primary flex items-center gap-2">
          <span className="text-blue-600 text-2xl drop-shadow-sm">△</span>
          AI 2D→3D Designer
        </h2>
        <p className="text-[10px] text-tertiary font-extrabold uppercase tracking-widest mt-1.5 ml-8">Design Studio Pro</p>
      </div>

      <div className="flex-1 overflow-y-auto w-full flex flex-col custom-scrollbar px-4 py-6 space-y-8">

        {/* Navigation */}
        <div>
          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3 px-2">Main Menu</span>
          <nav className="flex flex-col gap-1.5">
            {navItems.map(({ id, icon, label, always }) => {
              const enabled = always || !!currentImage;
              const active  = currentView === id;
              return (
                <button
                  key={id}
                  onClick={() => { if (enabled) actions.setCurrentView(id); }}
                  disabled={!enabled}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[13px] text-left
                    ${active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : enabled
                        ? "text-secondary hover:bg-surface-2 dark:hover:bg-surface-3"
                        : "text-tertiary opacity-40 cursor-not-allowed"
                    }`}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* My Projects — Real Thumbnails */}
        <div>
          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3 px-2">My Projects</span>
          {recentDesigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-3 p-4 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-2xl opacity-40">🖼️</span>
              <p className="text-[10px] text-tertiary font-bold">No saved projects yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentDesigns.slice(0, 4).map((design) => (
                <button
                  key={design.id}
                  onClick={() => actions.loadDesign(design.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 dark:hover:bg-surface-3 transition-all group text-left w-full"
                >
                  {/* Real thumbnail */}
                  <div className="w-10 h-10 rounded-lg border border-surface-3 overflow-hidden flex-shrink-0 bg-surface-2">
                    {design.image ? (
                      <img
                        src={design.image}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-xs">🎨</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center pr-1">
                    <div className="flex-1 min-w-0 pr-2">
                       <p className="text-[11px] font-black text-primary truncate group-hover:text-blue-600 transition-colors">{design.name}</p>
                       <p className="text-[9px] text-tertiary font-bold">
                         {new Date(design.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                       </p>
                    </div>
                    {/* 3D badge */}
                    {design.modelUrl && (
                      <span className="text-[8px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 flex-shrink-0 mr-1 hidden group-hover:hidden sm:block">3D</span>
                    )}
                    {/* Delete button (shows on hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.deleteDesign(design.id);
                        toastEmit({ message: "Design deleted", type: "success" });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 hover:text-red-600 text-tertiary rounded-md transition-all flex-shrink-0"
                      title="Delete Design"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </button>
              ))}
              {recentDesigns.length > 4 && (
                <button
                  onClick={() => actions.setCurrentView("dashboard")}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-600 text-center py-1 transition-colors"
                >
                  +{recentDesigns.length - 4} more in Dashboard →
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Mode toggle & Status ─────────────────────────────────── */}
      <div className="px-6 py-5 border-t border-surface-3 bg-surface-1/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-tertiary uppercase tracking-widest">API Status</span>
            <span className="flex items-center gap-1.5 text-[11px] font-black text-primary">
              <span className={`w-2 h-2 rounded-full ${apiMode === "demo" ? "bg-orange-500" : "bg-green-500 animate-pulse"} shadow-sm`} />
              {apiMode === "demo" ? "Mock Render" : "Live Render"}
            </span>
          </div>
          <button
            onClick={() => actions.toggleApiMode()}
            className="p-2 rounded-lg bg-white dark:bg-surface-3 border border-surface-3 text-secondary hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            title="Toggle API Mode"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.44-5.44"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
