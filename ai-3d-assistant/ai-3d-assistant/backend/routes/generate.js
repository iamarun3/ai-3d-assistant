import express from "express";
import { generate3DWithColab } from "../services/triposr.js";
const router = express.Router();

router.post("/generate-3d", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl required" });
    }

    const modelUrl = await generate3DWithColab(imageUrl);
    console.log("MODEL URL:", modelUrl);
    

    res.json({
      success: true,
      modelUrl,
    });

  } catch (err) {
    console.error("❌ Generate error:", err.message);

    res.status(500).json({
      error: "3D generation failed",
      details: err.message,
    });
  }
});

export default router;