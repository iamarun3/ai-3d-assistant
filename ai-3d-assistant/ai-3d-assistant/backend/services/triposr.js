import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import sharp from "sharp";

export async function generate3DWithColab(imageUrl) {
  try {
    console.log("🚀 Using LOCAL image:", imageUrl);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadDir = path.join(__dirname, "../uploads");

    // ⚡ SUPER FAST CACHING: Check if we already generated a model for this exact image UUID
    const fileBaseName = path.basename(imageUrl, path.extname(imageUrl));
    const cachedFilePath = path.join(uploadDir, `model-${fileBaseName}.glb`);

    if (fs.existsSync(cachedFilePath)) {
      console.log("⚡ CACHE HIT! Returning existing 3D model right away to save Colab API call...");
      return `${process.env.BASE_URL}/uploads/model-${fileBaseName}.glb`;
    }

    // ✅ Fetch image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Failed to fetch local image");

    const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

    // 🔄 Force Convert to PNG (Colab TripoSR PIL script strictly fails on JPEG bytes with .png name)
    console.log("🔄 Transcoding image buffer to pure PNG...");
    const pngBuffer = await sharp(rawBuffer).png().toBuffer();

    // ✅ Send to Colab/FastAPI
    const formData = new FormData();
    formData.append("image", pngBuffer, { // 🔥 Flask script expects "image", not "file"
      filename: "upload.png",
      contentType: "image/png",
    });

    console.log("📤 Sending IMAGE FILE to Colab...");

    // Force IPv4 and bypass strict TLS to fix Ngrok socket disconnections
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      family: 4
    });

    // Make sure you place your active Cloudflare URL in your .env file or hardcode it below:
    const COLAB_URL = process.env.COLAB_URL || "https://bills-dispatch-blend-hepatitis.trycloudflare.com";

    const res = await fetch(`${COLAB_URL}/generate`, { // 🔥 Flask expects /generate
      method: "POST",
      body: formData,
      agent: httpsAgent,
      headers: {
        "User-Agent": "Fetch"
      }
    });

    // ❌ HTTP error
    if (!res.ok) {
      const err = await res.text();
      console.error("❌ Colab error response:", err);
      throw new Error("Colab API failed");
    }

    // 🔥 Validate response
    const resContentType = res.headers.get("content-type") || "";
    console.log("📦 Content-Type:", resContentType);

    let modelBuffer;

    if (resContentType.includes("application/json")) {
      const json = await res.json();
      console.log("📦 JSON Response Keys:", Object.keys(json));

      if (json.error || json.detail) {
        throw new Error(`Colab/FastAPI Error: ${JSON.stringify(json)}`);
      }

      // Try to extract base64 if wrapped in JSON
      const base64Data = json.model || json.data || json.file || json.base64 || json.model_base64;
      if (!base64Data) {
        throw new Error(`Invalid JSON schema in success response. Keys found: ${Object.keys(json)}`);
      }
      const cleanB64 = base64Data.replace(/^data:.*\/.*;base64,/, "");
      modelBuffer = Buffer.from(cleanB64, "base64");

    } else {
      // Treat as binary model payload (FileResponse)
      modelBuffer = Buffer.from(await res.arrayBuffer());
    }

    console.log("📏 Model size:", modelBuffer.length);

    if (modelBuffer.length < 1000) {
      throw new Error(`Extracted model is far too small. Length: ${modelBuffer.length}`);
    }

    // ✅ SAVE FILE (YOU MISSED THIS)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save using the image's UUID instead of a fresh Date.now() timestamp so caching works perfectly!
    const fileName = `model-${fileBaseName}.glb`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, modelBuffer);

    console.log("✅ Model saved:", fileName);

    // ✅ RETURN URL (CRITICAL)
    return `${process.env.BASE_URL}/uploads/${fileName}`;

  } catch (err) {
    console.error("❌ Colab error:", err.message);
    return null;
  }
}