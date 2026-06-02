/**
 * components/ThreeViewer.jsx
 * Interactive 3D model viewer using Three.js.
 * Lazy-mounted; cleaned up when unmounted.
 */

import { useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore.js";
import { mountThreeScene } from "../utils/threeUtils.js";

/**
 * @param {{ imageUrl: string|null, modelUrl: string|null }} props
 */
export default function ThreeViewer({ imageUrl, modelUrl }) {
  const containerRef = useRef(null);
  const cleanupRef   = useRef(null);
  const apiRef       = useRef(null);
  const modelSize    = useStore((s) => s.modelSize);
  const modelRotation= useStore((s) => s.modelRotation);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Dispose previous scene before mounting a new one
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      apiRef.current = null;
    }

    // Small timeout so the container has correct dimensions after layout
    const t = setTimeout(() => {
      const api = mountThreeScene(el, imageUrl, modelUrl);
      apiRef.current = api;
      cleanupRef.current = api.dispose;
      
      // Apply initial state
      if (modelSize && typeof modelRotation !== 'undefined') {
         api.setTransform(modelSize, modelRotation);
      }
    }, 80);

    return () => {
      clearTimeout(t);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [imageUrl, modelUrl]);
  
  useEffect(() => {
    if (apiRef.current && modelSize) {
      apiRef.current.setTransform(modelSize, modelRotation || 0);
    }
  }, [modelSize, modelRotation]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-surface-3">
      {/* Canvas mount point */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls hint */}
      <div className="absolute bottom-3 left-3 bg-black/60 text-slate-500 text-[10px] font-mono px-2.5 py-1 rounded-md pointer-events-none">
        🖱️ Drag · Scroll to zoom · Auto-rotate
      </div>

      {/* Live badge */}
      <div className="absolute top-3 right-3 bg-green-500/15 border border-green-500/40 text-green-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full pointer-events-none">
        ● LIVE 3D
      </div>
    </div>
  );
}
