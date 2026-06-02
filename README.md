# 🚀 AI 2D→3D Design Assistant

Transform 2D images into interactive 3D models using AI. Upload an image, describe edits in natural language, and get a real-time 3D model — all in a chat-based interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 Image Upload | Drag-and-drop or click — auto-compressed |
| ✏️ Natural Language Editing | "make it metallic", "change color to red" |
| 🎭 Mask Editor | Brush, rectangle, lasso for region editing |
| 🎲 3D Model Generation | GLB output via TripoSR/Replicate |
| 👁️ Interactive 3D Viewer | Rotate, zoom, pan with Three.js |
| ⬇️ Download | Export .glb for Blender / Unity / web |
| 🟡 Demo Mode | Full canvas-based fallback — no APIs needed |

---

## 🗂️ Project Structure

```
ai-3d-assistant/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── App.jsx             # Main app (chat UI + 3D viewer + mask editor)
│   │   └── main.jsx            # React entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Node.js + Express
│   ├── server.js               # App entry, middleware, routes
│   ├── routes/
│   │   ├── upload.js           # POST /api/upload-image
│   │   ├── edit.js             # POST /api/edit-image, /api/inpaint-image
│   │   ├── generate.js         # POST /api/generate-3d
│   │   └── model.js            # GET /api/model/:id
│   ├── services/
│   │   ├── gemini.js           # Google Gemini image editing
│   │   ├── replicate.js        # Replicate TripoSR 3D generation
│   │   └── supabase.js         # Supabase storage + DB
│   ├── uploads/                # Local file storage (fallback)
│   ├── models/                 # Local GLB storage
│   └── .env.example
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd frontend
cp .env.example .env.local
# Edit VITE_API_URL if needed
```

### 3. Run in Demo Mode (no APIs needed)

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** — the app runs in demo mode with canvas-based editing and Three.js 3D viewer.

---

## 🔑 API Keys Setup

### Google Gemini (Image Editing)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to `backend/.env`: `GEMINI_API_KEY=your_key`

The app uses `gemini-2.0-flash-exp-image-generation` for image editing.

### Replicate (3D Generation)

1. Sign up at [https://replicate.com](https://replicate.com)
2. Go to Account → API Tokens
3. Add to `backend/.env`: `REPLICATE_API_TOKEN=your_token`

The app uses **TripoSR** (`stability-ai/triposr`) — generates a GLB in ~30-60s.

### Supabase (Storage + DB) — Optional

1. Create a project at [https://supabase.com](https://supabase.com)
2. Create a storage bucket named `ai-designs` (set to public)
3. Create a table `design_jobs` with columns: `id`, `status`, `image_url`, `model_url`, `created_at`
4. Add keys to `backend/.env`

Without Supabase, files are stored locally in `backend/uploads/` and `backend/models/`.

---

## 🧩 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-image` | Upload & compress an image |
| POST | `/api/edit-image` | Edit image with natural language |
| POST | `/api/inpaint-image` | Region-based editing with mask |
| POST | `/api/generate-3d` | Generate GLB from image |
| GET | `/api/model/:id` | Download a 3D model |
| GET | `/api/health` | Check service status |

### Example: Edit Image

```bash
curl -X POST http://localhost:3001/api/edit-image \
  -F "image=@photo.jpg" \
  -F "prompt=make it metallic and shiny"
```

Response:
```json
{
  "editedImageUrl": "http://localhost:3001/uploads/edited/uuid.jpg",
  "imageId": "uuid",
  "prompt": "make it metallic and shiny",
  "success": true
}
```

### Example: Generate 3D

```bash
curl -X POST http://localhost:3001/api/generate-3d \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://your-image-url.jpg"}'
```

Response:
```json
{
  "jobId": "uuid",
  "modelUrl": "https://replicate.delivery/...model.glb",
  "success": true
}
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Three.js (3D viewer with manual orbit controls)
- Vanilla CSS (dark theme, no Tailwind dependency issues)

**Backend**
- Node.js 18 + Express 4
- Sharp (image compression)
- Multer (file handling)
- Google Gemini API (image editing)
- Replicate API / TripoSR (3D generation)
- Supabase (storage + DB)

---

## 🎯 Usage Guide

1. **Upload** — Click 📎 or "Upload Image" in the sidebar
2. **Edit** — Type a prompt like "make it metallic" and press Enter
3. **Mask** (optional) — Click 🎭 to open the mask editor, draw the region, apply
4. **View 3D** — The 3D viewer appears automatically after generation
5. **Download** — Click the download button below the 3D viewer

### Example Prompts
- `"make it metallic and reflective"`
- `"change the color to deep red"`
- `"add a wooden texture"`
- `"make it look golden"`
- `"apply a vintage sepia filter"`
- `"make it darker and more dramatic"`

---

## 🚀 Production Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Set environment variable: `VITE_API_URL=https://your-backend.com/api`

### Backend (Railway / Render / Fly.io)
```bash
cd backend
npm start
```

Set all environment variables in your hosting dashboard.

---

## 🔒 Security Notes

- Image uploads are validated by MIME type
- File size limited to 20MB
- CORS restricted to `FRONTEND_URL`
- Helmet.js for security headers
- Never commit your `.env` file

---

## 📄 License

MIT
