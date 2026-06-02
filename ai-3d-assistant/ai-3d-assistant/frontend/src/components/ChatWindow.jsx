/**
 * components/ChatWindow.jsx
 * Scrollable message list. Auto-scrolls to newest message.
 */

import { useRef, useEffect } from "react";
import { useStore } from "../hooks/useStore.js";
import ChatMessage from "./ChatMessage.jsx";

export default function ChatWindow() {
  const messages = useStore((s) => s.messages);
  const endRef   = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

const handleDownload = async (urlOrMsg, filename = "download") => {
  try {
    let url = urlOrMsg;
    if (urlOrMsg && typeof urlOrMsg === "object") {
      url = urlOrMsg.modelUrl;
      filename = "model.glb";
    }

    if (!url) {
      console.error("❌ No download URL provided");
      return;
    }

    console.log("🔥 Downloading:", url);

    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

  } catch (err) {
    console.error("❌ Download error:", err);
  }
};

  return (
    <div className="flex-1 overflow-auto px-5 py-5">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} msg={msg} onDownload={handleDownload} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
