/**
 * utils/imageUtils.js
 * Image compression, canvas-based editing effects, and mask export.
 */

// ── Compression ────────────────────────────────────────────────────────

/**
 * Compress an image File to JPEG, capped at maxWidth.
 * @param {File}   file      - Input image file
 * @param {number} maxWidth  - Maximum dimension (default 1024)
 * @param {number} quality   - JPEG quality 0-1 (default 0.85)
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const ratio = Math.min(1, maxWidth / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// ── Canvas-based effects (demo mode) ──────────────────────────────────

/**
 * Apply a CSS-compositing effect to simulate AI image editing.
 * Used in demo mode when real APIs are unavailable.
 *
 * @param {HTMLImageElement} imgEl  - Loaded <img> element
 * @param {string}           prompt - Natural language prompt
 * @returns {string} data URL of the edited image (JPEG)
 */
export function applyCanvasEffect(imgEl, prompt) {
  const canvas = document.createElement("canvas");
  canvas.width  = imgEl.naturalWidth  || 512;
  canvas.height = imgEl.naturalHeight || 512;
  const ctx = canvas.getContext("2d");

  // Draw base image
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  const p = prompt.toLowerCase();

  if (p.includes("metallic") || p.includes("metal") || p.includes("chrome")) {
    applyMetallic(ctx, canvas.width, canvas.height);
  } else if (p.includes("red") || p.includes("crimson") || p.includes("scarlet")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(255,60,60,.55)", "multiply");
  } else if (p.includes("blue") || p.includes("ocean") || p.includes("navy")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(60,100,255,.55)", "multiply");
  } else if (p.includes("green") || p.includes("emerald") || p.includes("forest")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(40,180,90,.5)", "multiply");
  } else if (p.includes("gold") || p.includes("golden")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(255,195,40,.55)", "multiply");
  } else if (p.includes("purple") || p.includes("violet") || p.includes("magenta")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(150,50,200,.5)", "multiply");
  } else if (p.includes("orange") || p.includes("amber")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(255,140,20,.5)", "multiply");
  } else if (p.includes("wood") || p.includes("wooden") || p.includes("timber")) {
    applyWoodGrain(ctx, canvas.width, canvas.height);
  } else if (p.includes("dark") || p.includes("shadow") || p.includes("noir")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(10,10,20,.55)", "multiply");
  } else if (p.includes("bright") || p.includes("light") || p.includes("glow")) {
    applyColorTint(ctx, canvas.width, canvas.height, "rgba(255,255,255,.28)", "screen");
  } else if (p.includes("sepia") || p.includes("vintage") || p.includes("retro")) {
    applySepia(ctx, canvas.width, canvas.height);
  } else if (p.includes("neon") || p.includes("cyber") || p.includes("futuristic")) {
    applyNeon(ctx, canvas.width, canvas.height);
  } else if (p.includes("rust") || p.includes("weathered") || p.includes("aged")) {
    applyRust(ctx, canvas.width, canvas.height);
  } else {
    // Generic hue shift for unknown prompts
    const hue = Math.floor(Math.random() * 360);
    ctx.globalCompositeOperation = "hue";
    ctx.fillStyle = `hsl(${hue},60%,50%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/jpeg", 0.92);
}

// ── Effect helpers ─────────────────────────────────────────────────────

function applyColorTint(ctx, w, h, color, mode) {
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function applyMetallic(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0,   "rgba(170,170,195,.45)");
  g.addColorStop(0.35,"rgba(230,230,250,.55)");
  g.addColorStop(0.65,"rgba(180,180,200,.40)");
  g.addColorStop(1,   "rgba(100,100,125,.45)");
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(200,200,220,.12)";
  ctx.fillRect(0, 0, w, h);
}

function applyWoodGrain(ctx, w, h) {
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(160,90,30,.35)";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "overlay";
  for (let y = 0; y < h; y += 14) {
    const v = 0.08 + 0.06 * Math.sin(y / 3);
    ctx.fillStyle = `rgba(${100 + (y % 5) * 12},${55 + (y % 7) * 6},15,${v})`;
    ctx.fillRect(0, y, w, 10);
  }
}

function applySepia(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    px[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    px[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    px[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }
  ctx.putImageData(d, 0, 0);
}

function applyNeon(ctx, w, h) {
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.5);
  g.addColorStop(0,   "rgba(80,255,200,.22)");
  g.addColorStop(0.5, "rgba(60,100,255,.18)");
  g.addColorStop(1,   "rgba(200,0,255,.14)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function applyRust(ctx, w, h) {
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(180,80,20,.4)";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 4 + Math.random() * 18;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${150 + Math.random() * 60},${30 + Math.random() * 40},0,.15)`;
    ctx.fill();
  }
}

// ── Mask export ────────────────────────────────────────────────────────

/**
 * Convert a drawing canvas to a black-and-white mask PNG.
 * White = region to edit, Black = keep original.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {string} Base64 PNG data URL
 */
export function exportMask(canvas) {
  const tmp = document.createElement("canvas");
  tmp.width  = canvas.width;
  tmp.height = canvas.height;
  const ctx = tmp.getContext("2d");
  ctx.drawImage(canvas, 0, 0);

  const d  = ctx.getImageData(0, 0, tmp.width, tmp.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const alpha = px[i + 3];
    const v     = alpha > 10 ? 255 : 0;
    px[i] = px[i + 1] = px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);
  return tmp.toDataURL("image/png");
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Load an image from a URL into an HTMLImageElement.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = () => rej(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
