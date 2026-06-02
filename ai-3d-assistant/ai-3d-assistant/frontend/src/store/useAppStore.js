/**
 * store/useAppStore.js
 * Lightweight pub/sub state store — no external dependencies.
 */

export const initialState = {
  currentImage:       null,
  currentEditedImage: null,
  currentMask:        null,
  modelUrl:           null,
  recentDesigns:      JSON.parse(localStorage.getItem('ai_designer_projects')) || [],
  messages: [
    {
      id:   "welcome",
      role: "assistant",
      ts:   Date.now(),
      text: "👋 Welcome to AI 2D\u21923D Design Assistant!\n\nUpload an image, describe how to edit it, and watch it become an interactive 3D model.\n\nTry prompts like:\n\u2022 \"make it metallic\"\n\u2022 \"change color to red\"\n\u2022 \"add wooden texture\"\n\u2022 \"neon cyberpunk style\"",
    },
  ],
  isLoading:      false,
  showMaskEditor: false,
  sidebarOpen:    true,
  apiMode:        "live",
  theme:          "light", // "light" or "dark"
  promptHistory:  [],
  hasStarted:     false,
  modelSize:      [50, 45, 60],
  modelRotation:  0,
  currentView:    "dashboard",
};

let _state = { ...initialState };
export const listeners = new Set();

export function getState()  { return _state; }

export function setState(partial) {
  const next = typeof partial === "function" ? partial(_state) : partial;
  _state = { ..._state, ...next };
  
  // Side effect for theme changes
  if (next.theme !== undefined) {
    if (next.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  }
  
  listeners.forEach((fn) => fn(_state));
}

export const actions = {
  setCurrentImage(d)  { setState({ currentImage: d, currentEditedImage: null, currentMask: null, modelUrl: null }); },
  setEditedImage(url) { setState({ currentEditedImage: url }); },
  setMask(mask)       { setState({ currentMask: mask }); },
  clearMask()         { setState({ currentMask: null }); },
  setModelUrl(url)    { setState({ modelUrl: url }); },
  setLoading(val)     { setState({ isLoading: val }); },
  toggleSidebar()     { setState((s) => ({ sidebarOpen: !s.sidebarOpen })); },
  toggleApiMode()     { setState((s) => ({ apiMode: s.apiMode === "demo" ? "live" : "demo" })); },
  setTheme(theme)     { setState({ theme }); },
  toggleTheme()       { setState((s) => ({ theme: s.theme === "light" ? "dark" : "light" })); },
  startApp()          { setState({ hasStarted: true }); },
  openMaskEditor()    { setState({ showMaskEditor: true }); },
  closeMaskEditor()   { setState({ showMaskEditor: false }); },

  addMessage(msg) {
    const full = { id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), ...msg };
    setState((s) => ({ messages: [...s.messages, full] }));
    return full.id;
  },

  updateMessage(id, updates) {
    setState((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)) }));
  },

  addToHistory(prompt) {
    setState((s) => ({
      promptHistory: [prompt, ...s.promptHistory.filter((p) => p !== prompt)].slice(0, 10),
    }));
  },

  setCurrentView(view) { setState({ currentView: view }); },
  setModelSize(size) { setState({ modelSize: size }); },
  setModelRotation(rot) { setState({ modelRotation: rot }); },

  reset() {
    setState({ currentImage: null, currentEditedImage: null, currentMask: null, modelUrl: null, isLoading: false, showMaskEditor: false, modelSize: [50, 45, 60], modelRotation: 0, currentView: "dashboard" });
  },

  saveCurrentDesign(name) {
    setState((s) => {
      if (!s.modelUrl) return {};
      const newDesign = {
        id: `design-${Date.now()}`,
        name: name || `Project ${s.recentDesigns.length + 1}`,
        image: s.currentEditedImage || (s.currentImage ? s.currentImage.url : null),
        modelUrl: s.modelUrl,
        timestamp: Date.now()
      };
      const updatedDesigns = [newDesign, ...s.recentDesigns];
      try { localStorage.setItem('ai_designer_projects', JSON.stringify(updatedDesigns)); } catch(e){}
      return { recentDesigns: updatedDesigns };
    });
  },

  loadDesign(id) {
    setState((s) => {
      const design = s.recentDesigns.find(d => d.id === id);
      if (!design) return {};
      return {
        currentImage: design.image ? { url: design.image } : null,
        currentEditedImage: design.image,
        modelUrl: design.modelUrl,
        currentView: "finalization",
        hasStarted: true
      };
    });
  },

  deleteDesign(id) {
    setState((s) => {
      const updatedDesigns = s.recentDesigns.filter((d) => d.id !== id);
      try {
        localStorage.setItem("ai_designer_projects", JSON.stringify(updatedDesigns));
      } catch (e) {}
      
      // If we are currently viewing the deleted design, maybe clear the view, or simply remove from list
      return { recentDesigns: updatedDesigns };
    });
  },
};
