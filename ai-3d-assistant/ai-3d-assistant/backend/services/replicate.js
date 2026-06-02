import Replicate from "replicate";
import fetch from "node-fetch";

export async function editImageWithReplicate(buffer, prompt) {
  console.log("Using Replicate image edit model...");

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
  const version =
    process.env.REPLICATE_EDIT_VERSION ||
    "arielreplicate/instruct-pix2pix:10e63b0e6361eb23a0374f4d9ee145824d9d09f7a31dcd70803193ebc7121430";

  const output = await replicate.run(version, {
    input: {
      input_image: base64Image,
      instruction_text: prompt,
      cfg_text: 9,
      cfg_image: 1.2,
      resolution: 512,
    },
  });

  const imageUrl = Array.isArray(output) ? output[0] : output;
  if (!imageUrl) {
    throw new Error("Replicate returned no edited image URL");
  }

  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download edited image: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
