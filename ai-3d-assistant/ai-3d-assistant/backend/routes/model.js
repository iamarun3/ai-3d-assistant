/**
 * GET /api/model/:id
 * Proxy or serve 3D model files (.glb)
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/model/:id", (req, res) => {
  const modelsDir = path.join(__dirname, "../models");
  const filePath = path.join(modelsDir, `${req.params.id}.glb`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Model not found", id: req.params.id });
    }
  });
});

export default router;
