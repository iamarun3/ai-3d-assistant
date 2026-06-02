/**
 * hooks/useWorkflow.js
 * Orchestrates: upload → edit → 3D generation.
 */
import { useCallback } from "react";
import { actions, getState } from "../store/useAppStore.js";
import { compressImage, applyCanvasEffect, loadImage } from "../utils/imageUtils.js";
import { API_BASE } from "../utils/config.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function useWorkflow() {
  /* ── Upload ──────────────────────────────────────────── */
  const uploadImage = useCallback(async (file) => {
    if (!file?.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      actions.setCurrentImage({ url, file: compressed });
      actions.addMessage({ role: "user", imageUrl: url, text: "📁 Uploaded: " + file.name });
      actions.addMessage({
        role: "assistant",
        text: "✅ Image received! Describe how you'd like to edit it.\n\nTry: \"make it metallic\", \"change color to red\", \"add wooden texture\"\n\nOptionally click 🎭 to select a specific region with the mask editor.",
      });
    } catch (err) {
      actions.addMessage({ role: "assistant", text: "⚠️ Failed to process image: " + err.message });
    }
  }, []);

  /* ── Edit image ──────────────────────────────────────── */
  const editImage = useCallback(async (prompt, maskData) => {
    const { currentImage, apiMode } = getState();
    if (!currentImage) throw new Error("No image loaded");

    if (apiMode === "demo") {
      await sleep(1400);
      const img = await loadImage(currentImage.url);
      return applyCanvasEffect(img, prompt);
    }

    const fd = new FormData();
    fd.append("image", currentImage.file);
    fd.append("prompt", prompt);
    if (maskData) fd.append("mask", maskData);

    const endpoint = maskData ? "/inpaint-image" : "/edit-image";
    const resp = await fetch(API_BASE + endpoint, { method: "POST", body: fd });
    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      throw new Error(e.error || "API error " + resp.status);
    }
    return (await resp.json()).editedImageUrl;
  }, []);

  /* ── Generate 3D ─────────────────────────────────────── */
  const generate3D = useCallback(async (editedImageUrl) => {
  const { apiMode } = getState();

  if (apiMode === "demo") {
    await sleep(2400);
    return null;
  }

  console.log("🚀 Sending to backend:", editedImageUrl);

  const resp = await fetch("http://localhost:3001/api/generate-3d", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl: editedImageUrl,
    }),
  });

  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.error || "3D API error " + resp.status);
  }

  const data = await resp.json();

  console.log("🔥 Backend response:", data);

  if (!data.modelUrl) {
    throw new Error("No modelUrl returned from backend");
  }

  return data.modelUrl;
}, []);
  /* ── Full pipeline ───────────────────────────────────── */
  const runPipeline = useCallback(async (prompt) => {
    const { currentImage, currentMask, isLoading } = getState();
    if (!prompt.trim() || isLoading) return;
    if (!currentImage) {
      actions.addMessage({ role: "assistant", text: "⚠️ Upload an image first!" });
      return;
    }

    actions.setLoading(true);
    actions.addToHistory(prompt);
    actions.addMessage({ role: "user", text: prompt });

    const botId = actions.addMessage({ role: "assistant", text: "🧠 Understanding your prompt…", step: "understanding" });

    try {
      await sleep(600);
      actions.updateMessage(botId, {
        step: "editing",
        text: "✏️ Editing image: \"" + prompt + "\"" + (currentMask ? " (masked region)" : "") + "…",
      });

      const editedUrl = await editImage(prompt, currentMask);
      actions.setEditedImage(editedUrl);
      actions.updateMessage(botId, { step: "editing", text: "✅ Image edited — \"" + prompt + "\"", editedImageUrl: editedUrl });

      await sleep(400);
      const genId = actions.addMessage({ role: "assistant", step: "generating", text: "🎲 Generating 3D model…" });

      const modelUrl = await generate3D(editedUrl);
      actions.setModelUrl(modelUrl);
      actions.updateMessage(genId, {
        step: "complete",
        text: "🎉 3D model ready! Drag to rotate · Scroll to zoom",
        show3D: true,
        imageUrl: currentImage.url,
        editedImageUrl: editedUrl,
        modelUrl,
      });
    } catch (err) {
      console.error("Pipeline error:", err);
      actions.updateMessage(botId, { step: null, text: "⚠️ " + err.message });
    } finally {
      actions.setLoading(false);
      actions.clearMask();
    }
  }, [editImage, generate3D]);

  /* ── Generate 3D Directly (Skip Edit) ────────────────── */
  const generate3DDirectly = useCallback(async () => {
    const { currentImage, isLoading } = getState();
    if (!currentImage) {
      actions.addMessage({ role: "assistant", text: "⚠️ Upload an image first!" });
      return;
    }
    if (isLoading) return;

    actions.setLoading(true);

    const genId = actions.addMessage({ role: "assistant", step: "generating", text: "⚡ Fast-tracking: Generating 3D model directly from original upload…" });

    try {
      let finalImageUrl = currentImage.url;

      // If it's a local object URL, we must upload it to the backend first
      // so the Colab worker has a reachable URL to download from.
      if (finalImageUrl.startsWith("blob:")) {
        const fd = new FormData();
        fd.append("image", currentImage.file);
        
        const resp = await fetch(API_BASE + "/upload-image", { method: "POST", body: fd });
        if (!resp.ok) throw new Error("Failed to prepare image for 3D generation.");
        const data = await resp.json();
        finalImageUrl = data.imageUrl;
      }

      // Set editedImage to the real backend URL so we bypass editing cleanly
      actions.setEditedImage(finalImageUrl);
      
      const modelUrl = await generate3D(finalImageUrl);
      actions.setModelUrl(modelUrl);
      actions.updateMessage(genId, {
        step: "complete",
        text: "🎉 3D model ready! Drag to rotate · Scroll to zoom",
        show3D: true,
        imageUrl: finalImageUrl,
        editedImageUrl: finalImageUrl,
        modelUrl,
      });
    } catch (err) {
      console.error("Direct 3D Pipeline error:", err);
      actions.updateMessage(genId, { step: null, text: "⚠️ " + err.message });
    } finally {
      actions.setLoading(false);
    }
  }, [generate3D]);

  return { uploadImage, editImage, generate3D, runPipeline, generate3DDirectly };
}
