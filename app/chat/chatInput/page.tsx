"use client";

import { SendButton } from "./components/SendButton";
import { Suggestions } from "./components/Suggestion";
import { useState, useRef } from "react";
import { InputField } from "../input/components/InputField";
import { ImagePlus, Loader2 } from "lucide-react"; 

interface ChatInputProps {
  onMessageReceived: (userMessage: any, aiReply: any) => void;
  history: { role: string; content: string }[];
  setIsTyping: (val: boolean) => void;
}

export default function ChatInput({
  onMessageReceived,
  history,
  setIsTyping,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (textToSend?: string) => {
    const finalInput = textToSend || input;
    if (!finalInput.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: finalInput }],
        }),
      });
      const data = await response.json();
      if (data.reply) onMessageReceived(finalInput, data.reply);
    } catch (error) {
      onMessageReceived(finalInput, "Холболтын алдаа гарлаа.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setIsTyping(true);

    const imageUrl = URL.createObjectURL(file);
    const userImageMsg = `<img src="${imageUrl}" class="w-48 rounded-lg border border-white/10" />`;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/visual-search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Search failed");

      const product = await response.json();
      
      onMessageReceived(userImageMsg, {
        type: "product_card",
        data: product
      });

    } catch (error) {
      onMessageReceived(userImageMsg, "Уучлаарай, зургийг таньж чадсангүй.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}
        </button>

        <InputField
          value={input}
          onChange={setInput}
          onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />

        <SendButton
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          isLoading={isLoading}
        />
      </div>
    </footer>
  );
}