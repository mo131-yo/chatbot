"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { SendButton } from "./components/SendButton";
import { Suggestions } from "./components/Suggestion";
import { InputField } from "./components";
import { useVisualSearch } from "../hooks/useVisualSearch";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onVisualResult: (userMsg: any, aiMsg: any) => void;
  history: { role: string; content: string }[];
  isTyping: boolean;
}

export default function ChatInput({
  onSendMessage,
  onVisualResult,
  history,
  isTyping,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchByImage, isSearching } = useVisualSearch();

  const combinedLoading = isTyping || isSearching;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || combinedLoading) return;
    setInput("");
    onSendMessage(text);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || combinedLoading) return;

    const imageUrl = URL.createObjectURL(file);
    const userMsg = { type: "image", content: imageUrl };

    const result = await searchByImage(file);

    if (result.success && result.product) {
      onVisualResult(userMsg, { type: "product_card", data: result.product });
    } else {
      onVisualResult(userMsg, "Уучлаарай, тохирох бараа олдсонгүй.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <footer className="w-full max-w-4xl mx-auto p-4 relative z-50">
      <Suggestions visible={history?.length === 0} onSelect={handleSend} />

      <div className="relative flex items-center w-full gap-3 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={combinedLoading}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <ImagePlus size={22} />
          )}
        </button>

        <InputField
          value={input}
          onChange={setInput}
          onKeyDown={(e: any) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={combinedLoading}
        />

        <SendButton
          onClick={() => handleSend()}
          disabled={combinedLoading || !input.trim()}
          isLoading={isTyping}
        />
      </div>
    </footer>
  );
}