/**
 * components/MaskEditor.jsx
 * Full-screen modal canvas editor for creating brush/rectangle masks.
 * Exports a black-and-white PNG mask for region-based inpainting.
 */

import { useRef, useState, useEffect } from "react";
import { actions } from "../store/useAppStore.js";
import { useStore } from "../hooks/useStore.js";
import { exportMask } from "../utils/imageUtils.js";
import { MASK_TOOLS } from "../utils/config.js";

export default function MaskEditor() {
  const canvasRef   = useRef(null);
  const imgRef      = useRef(null);
  const snapRef     = useRef(null);
  const currentImage = useStore((s) => s.currentImage);

  const [tool,      setTool]      = useState("brush");
  const [brushSize, setBrushSize] = useState(22);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos,  setStartPos]  = useState(null);

  // Load the base image onto a backing <img> element
  useEffect(() => {
    if (!currentImage?.url) return;
    const img    = new Image();
    img.crossOrigin = "anonymous";
    img.src      = currentImage.url;
    img.onload   = () => {
      imgRef.current = img;
      const canvas   = canvasRef.current;
      if (!canvas) return;
      canvas.width   = img.naturalWidth;
      canvas.height  = img.naturalHeight;
    };
  }, [currentImage]);

  // ── Coordinate helper ─────────────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx     = e.touches ? e.touches[0].clientX : e.clientX;
    const cy     = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  // ── Drawing handlers ──────────────────────────────────────────────────
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    snapRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle   = "rgba(255,80,80,.85)";
      ctx.strokeStyle = "rgba(255,80,80,.85)";
      ctx.lineWidth   = brushSize;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap   = "round";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onDraw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e);

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255,80,80,.85)";
      ctx.lineWidth   = brushSize;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap   = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rectangle" && snapRef.current) {
      ctx.putImageData(snapRef.current, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle   = "rgba(255,80,80,.45)";
      ctx.strokeStyle = "rgba(255,80,80,1)";
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.rect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      ctx.fill();
      ctx.stroke();
    }
  };

  const endDraw = () => {
    setIsDrawing(false);
    setStartPos(null);
    snapRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyMask = () => {
    const mask = exportMask(canvasRef.current);
    actions.setMask(mask);
    actions.closeMaskEditor();
    actions.addMessage({
      role: "assistant",
      text: "🎭 Mask applied! Your next prompt will only affect the painted region.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-2xl p-5 max-w-[740px] w-full max-h-[92vh] overflow-auto border border-surface-3">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-mono text-sm text-slate-200">✏️ MASK EDITOR</h2>
          <button
            onClick={() => actions.closeMaskEditor()}
            className="px-3 py-1.5 rounded-lg border border-surface-3 text-slate-400 text-xs hover:border-slate-500 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          {MASK_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase transition-all"
              style={{
                border:      tool === t.id ? "1.5px solid #60a5fa" : "1px solid #374151",
                background:  tool === t.id ? "#1e3a5f"             : "#1f2937",
                color:       tool === t.id ? "#60a5fa"             : "#9ca3af",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}

          {/* Brush size */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 text-xs">Size:</span>
            <input
              type="range" min={5} max={70}
              value={brushSize}
              onChange={(e) => setBrushSize(+e.target.value)}
              className="w-20"
              style={{ accentColor: "#60a5fa" }}
            />
            <span className="text-accent-cyan text-xs font-mono w-8">{brushSize}px</span>
          </div>
        </div>

        {/* Canvas with image underlay */}
        <div
          className="relative rounded-xl overflow-hidden border border-surface-3"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        >
          {currentImage && (
            <img
              src={currentImage.url}
              alt="base"
              className="w-full block select-none pointer-events-none"
            />
          )}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDraw}
            onMouseMove={onDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={onDraw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 rounded-xl border border-surface-3 bg-transparent text-slate-400 text-sm hover:border-slate-500 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={applyMask}
            className="px-4 py-2 rounded-xl border-none text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
          >
            Apply Mask ✓
          </button>
        </div>
      </div>
    </div>
  );
}
