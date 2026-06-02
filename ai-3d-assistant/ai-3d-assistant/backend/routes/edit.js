import express from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

import { editImageWithReplicate } from "../services/replicate.js";
import { getSupabaseClient } from "../services/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 🎨 Local fallback editing (FREE + always works)
 */
async function fallbackEdit(buffer, prompt) {
  let image = sharp(buffer);
  const p = prompt.toLowerCase();

  if (p.includes("red")) {
    image = image.tint({ r: 255, g: 80, b: 80 });
  }

  if (p.includes("blue")) {
    image = image.tint({ r: 80, g: 80, b: 255 });
  }

  if (p.includes("green")) {
    image = image.tint({ r: 80, g: 255, b: 80 });
  }

  if (p.includes("bright")) {
    image = image.modulate({ brightness: 1.3 });
  }

  if (p.includes("dark")) {
    image = image.modulate({ brightness: 0.7 });
  }

  if (p.includes("contrast")) {
    image = image.linear(1.2, -20);
  }

  if (p.includes("grayscale")) {
    image = image.grayscale();
  }

  if (p.includes("sepia")) {
    image = image.tint({ r: 112, g: 66, b: 20 });
  }

  return await image.toBuffer();
}

/**
 * 💾 Save edited image
 */
async function saveEditedImage(buffer, imageId) {
  const supabase = getSupabaseClient();

  if (supabase) {
    const fileName = `edited/${imageId}.jpg`;

    const { error } = await supabase.storage
      .from("ai-designs")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
      });

    if (!error) {
      const { data } = supabase.storage
        .from("ai-designs")
        .getPublicUrl(fileName);

      return data.publicUrl;
    }
  }

  // Local fallback
  const editDir = path.join(__dirname, "../uploads/edited");
  await fs.mkdir(editDir, { recursive: true });

  const filePath = path.join(editDir, `${imageId}.jpg`);
  await fs.writeFile(filePath, buffer);

  return `${process.env.BASE_URL || "http://localhost:3001"}/uploads/edited/${imageId}.jpg`;
}

/**
 * ✅ POST /api/edit-image
 */
router.post("/edit-image", upload.single("image"), async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!req.file || !prompt) {
      return res.status(400).json({
        success: false,
        error: "image and prompt are required",
      });
    }

    const imageId = uuidv4();
    let editedBuffer;

    // 🔥 STEP 1: Try Replicate (REAL AI)
    try {
      console.log("🔥 Trying Replicate AI edit...");
      editedBuffer = await editImageWithReplicate(
        req.file.buffer,
        prompt
      );
      console.log("✅ Replicate success");
    } catch (repErr) {
      console.warn("⚠️ Replicate failed:", repErr.message);

      // 🎨 STEP 2: Fallback (LOCAL)
      console.log("🎨 Using local fallback editing...");
      editedBuffer = await fallbackEdit(req.file.buffer, prompt);
    }

    // 🧹 Compress output
    const compressed = await sharp(editedBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // 💾 Save image
    const editedImageUrl = await saveEditedImage(compressed, imageId);

    res.json({
      success: true,
      editedImageUrl,
      imageId,
      prompt,
      mode: "AI + fallback",
    });

  } catch (err) {
    next(err);
  }
});

/**
 * ❌ Disabled inpaint (Gemini not reliable)
 */
router.post("/inpaint-image", (_req, res) => {
  res.status(501).json({
    success: false,
    error: "Inpainting not supported yet",
  });
});

export default router;