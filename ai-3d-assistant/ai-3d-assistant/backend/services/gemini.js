import fetch from "node-fetch";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function editImageWithGemini(imageBuffer, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const base64Image = imageBuffer.toString("base64");

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // ⚠️ Gemini may not return image → fallback
  const base64 =
    data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

  if (!base64) {
    throw new Error("Gemini did not return image");
  }

  return Buffer.from(base64, "base64");
}

/**
 * Simple inpainting fallback
 */
export async function inpaintImageWithGemini(imageBuffer, maskBuffer, prompt) {
  return editImageWithGemini(imageBuffer, prompt);
}