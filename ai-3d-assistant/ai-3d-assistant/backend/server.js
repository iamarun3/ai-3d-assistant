import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import uploadRouter from "./routes/upload.js";
import editRouter from "./routes/edit.js";
import generateRouter from "./routes/generate.js";
import modelRouter from "./routes/model.js";

// ✅ MUST DEFINE THIS FIRST
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ LOAD ENV FROM backend/.env
dotenv.config({ path: path.join(__dirname, ".env") });

// ✅ CREATE APP (YOU MISSED THIS POSITION)
const app = express();
const PORT = process.env.PORT || 3001;

// 🔍 DEBUG TOKEN (VERY IMPORTANT)
console.log("🔑 TOKEN:", process.env.REPLICATE_API_TOKEN);

// ================= MIDDLEWARE =================
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// ================= STATIC FILES =================
const uploadsPath = path.join(__dirname, "uploads");
console.log("📂 Serving uploads from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

// ================= ROUTES =================
app.use("/api", uploadRouter);
app.use("/api", editRouter);
app.use("/api", generateRouter);
app.use("/api", modelRouter);

// ================= HEALTH =================
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      replicate: !!process.env.REPLICATE_API_TOKEN,
      supabase: !!process.env.SUPABASE_URL,
    },
  });
});

// ================= ERROR =================
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

// ================= START =================
app.listen(PORT, () => {
  console.log("\n🚀 Backend ready → http://localhost:" + PORT);
  console.log("🔑 Gemini   :", process.env.GEMINI_API_KEY ? "✅" : "❌");
  console.log("🔑 Replicate:", process.env.REPLICATE_API_TOKEN ? "✅" : "❌");
  console.log("🗄️ Supabase :", process.env.SUPABASE_URL ? "✅" : "❌");
});