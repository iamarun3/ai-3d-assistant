/**
 * utils/config.js
 * Central configuration constants.
 */

// Backend API base URL — set VITE_API_URL in .env.local to override
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Progress step definitions (used by ProgressBar component)
export const PROGRESS_STEPS = [
  { id: "upload",       icon: "📁", label: "Image uploaded"      },
  { id: "understanding",icon: "🧠", label: "Understanding prompt…"},
  { id: "editing",      icon: "✏️", label: "Editing image…"      },
  { id: "generating",   icon: "🎲", label: "Generating 3D…"      },
  { id: "complete",     icon: "✅", label: "Complete!"            },
];

// Mask tool definitions
export const MASK_TOOLS = [
  { id: "brush",     label: "Brush",     icon: "🖌️" },
  { id: "rectangle", label: "Rectangle", icon: "▭"  },
  { id: "lasso",     label: "Lasso",     icon: "🔘" },
  { id: "eraser",    label: "Eraser",    icon: "🧹" },
];

// Quick-prompt suggestions shown above the input bar
export const QUICK_PROMPTS = [
  "make it metallic",
  "change color to red",
  "add wooden texture",
  "make it golden",
  "vintage sepia look",
  "neon cyberpunk style",
  "rusty and weathered",
];

// 3D viewer defaults
export const VIEWER_CONFIG = {
  autoRotateSpeed: 0.007,
  fov:             45,
  near:            0.1,
  far:             100,
  cameraZ:         4,
  cameraY:         1.5,
};
