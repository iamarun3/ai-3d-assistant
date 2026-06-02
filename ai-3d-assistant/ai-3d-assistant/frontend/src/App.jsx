/**
 * App.jsx
 * Root component — wires together the full application layout:
 *   Sidebar | Header / ChatWindow / ChatInput
 * Conditionally renders the MaskEditor modal.
 */

import { useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Workspace from "./components/Workspace.jsx";
import RightPanel from "./components/RightPanel.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Finalization from "./components/Finalization.jsx";
import Header from "./components/Header.jsx";
import MaskEditor from "./components/MaskEditor.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import Toast from "./components/Toast.jsx";
import { useStore } from "./hooks/useStore.js";
import { actions } from "./store/useAppStore.js";

export default function App() {
  const sidebarOpen    = useStore((s) => s.sidebarOpen);
  const showMaskEditor = useStore((s) => s.showMaskEditor);
  const hasStarted     = useStore((s) => s.hasStarted);
  const currentView    = useStore((s) => s.currentView);

  return (
    <>
      <div className="relative flex h-screen w-screen overflow-hidden bg-surface text-slate-900 dark:text-slate-100 font-sans">
        {!hasStarted && <WelcomeScreen />}
        
        {/* Clean, Subtle Ambient Background */}
        <div className="absolute inset-0 bg-surface z-0 pointer-events-none transition-colors duration-500" />
        
        {/* Subtle radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-1 via-surface to-surface-2 opacity-100 z-0 pointer-events-none" />
        
        {/* Light accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] pointer-events-none animate-pulse-soft" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] pointer-events-none animate-float" />
        
        {/* Floating Header */}
        <div className={`absolute top-4 right-6 z-50 transition-all duration-500 ${!hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <Header />
        </div>

        {/* Global Layout Grid */}
        <div 
          className={`relative z-10 w-full h-full flex flex-row gap-4 lg:gap-6 p-4 lg:p-6 transition-all duration-700 delay-100 ${!hasStarted ? 'opacity-0 pointer-events-none scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'} pt-20`}
        >
          {/* Left Panel - App Navigation Sidebar */}
          <div className={`transition-all duration-500 ${sidebarOpen ? "w-[280px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full overflow-hidden"}`}>
            <Sidebar />
          </div>

          {/* Toggle Navigation Sidebar Button */}
          {!sidebarOpen && hasStarted && (
             <button onClick={() => actions.toggleSidebar()} className="absolute top-20 left-6 z-40 p-3 glass rounded-xl shadow-xl hover:scale-105 transition-all text-slate-500 hover:text-accent-blue border border-surface-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
          )}

          {/* Main Content Area - animated crossfade between views */}
          <div className="flex-1 flex flex-row gap-4 lg:gap-6 overflow-hidden relative">

            {/* Dashboard */}
            <div className={`absolute inset-0 flex transition-all duration-400 ${currentView === "dashboard" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}
              style={{ transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
              <Dashboard />
            </div>

            {/* Editor + Right Panel */}
            <div className={`absolute inset-0 flex gap-4 lg:gap-6 transition-all duration-400 ${currentView === "editor" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}
              style={{ transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
              <Workspace />
              <RightPanel />
            </div>

            {/* Finalization */}
            <div className={`absolute inset-0 flex transition-all duration-400 ${currentView === "finalization" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}
              style={{ transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
              <Finalization />
            </div>

          </div>
        </div>
      </div>

      {showMaskEditor && <MaskEditor />}
      <Toast />
    </>
  );
}
