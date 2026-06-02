import express from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { getSupabaseClient } from "../services/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageId = uuidv4();

    const buffer = await sharp(req.file.buffer)
      .resize(1024, 1024, { fit: "inside" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const supabase = getSupabaseClient();
    let imageUrl = null;

    if (supabase) {
      const fileName = `uploads/${imageId}.jpg`;
      const { error } = await supabase.storage
        .from("ai-designs")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
        });

      if (!error) {
        const { data } = supabase.storage
          .from("ai-designs")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      } else {
        console.warn("⚠️ Supabase upload failed, falling back to local:", error.message);
      }
    }

    // Fallback to local storage if Supabase isn't configured or failed
    if (!imageUrl) {
      const uploadDir = path.join(__dirname, "../uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, `${imageId}.jpg`);
      await fs.writeFile(filePath, buffer);
      
      const baseUrl = process.env.BASE_URL || "http://localhost:3001";
      imageUrl = `${baseUrl}/uploads/${imageId}.jpg`;
    }

    console.log("✅ Uploaded:", imageUrl);

    res.json({
      success: true,
      imageUrl,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;