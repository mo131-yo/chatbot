"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
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
  const [previewImage, setPreviewImage] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchByImage, isSearching } = useVisualSearch();

  const combinedLoading = isTyping || isSearching;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();

    if (previewImage) {
      const imageUrl = previewImage.url;
      const file = previewImage.file;
      const inputText = input.trim();
      setPreviewImage(null);
      setInput("");

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const userMsg = {
        type: "image",
        content: imageUrl,
        base64,
        text: inputText,
      };
      const result = await searchByImage(file);

      if (result.success && result.products?.length) {
        onVisualResult(userMsg, {
          type: "product_card",
          data: result.product,
          products: result.products,
        });
      } else {
        onVisualResult(userMsg, "Уучлаарай, тохирох бараа олдсонгүй.");
      }
      return;
    }

    if (!text || combinedLoading) return;
    setInput("");
    onSendMessage(text);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || combinedLoading) return;
    const url = URL.createObjectURL(file);
    setPreviewImage({ file, url });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = () => {
    if (previewImage) URL.revokeObjectURL(previewImage.url);
    setPreviewImage(null);
  };

  return (
    <footer className="w-full max-w-4xl mx-auto p-4 relative z-50">
      <Suggestions visible={history?.length === 0} onSelect={handleSend} />

      <div className="flex flex-col w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {previewImage && (
          <div className="px-3 pt-3">
            <div className="relative inline-block">
              <img
                src={previewImage.url}
                alt="preview"
                className="h-20 w-20 object-cover rounded-xl border border-white/20"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="relative flex items-center w-full gap-3 p-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
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
            onKeyDown={(e: any) =>
              e.key === "Enter" && !e.shiftKey && handleSend()
            }
            disabled={combinedLoading}
            placeholder={previewImage ? "Зураг илгээх..." : undefined}
          />

          <SendButton
            onClick={() => handleSend()}
            disabled={combinedLoading || (!input.trim() && !previewImage)}
            isLoading={isTyping || isSearching}
          />
        </div>
      </div>
    </footer>
  );
}
