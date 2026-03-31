"use client";

import { SendButton } from "./components/SendButton";
import { VoiceButton } from "./components/VoiceButton";
import { Suggestions } from "./components/Suggestion";
import { useState } from "react";
import { useVoiceToText } from "../hooks/useVoiceToText";
import { InputField } from "../input/components/InputField";

interface ChatInputProps {
  onMessageReceived: (userMessage: string, aiReply: string) => void;
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
  const { isRecording, isProcessing, startRecording, stopRecording } =
    useVoiceToText();

  const handleSend = async (textToSend?: string) => {
    const finalInput = textToSend || input;
    if (!finalInput.trim() || isLoading) return;

    setIsLoading(true);
    setInput("");

    const formattedHistory = history.map((h) => ({
      role:
        h.role === "assistant" || h.role === "tuslah" ? "assistant" : "user",
      content: h.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...formattedHistory,
            { role: "user", content: finalInput },
          ],
        }),
      });
      const data = await response.json();
      if (data.reply) onMessageReceived(finalInput, data.reply);
    } catch (error) {
      onMessageReceived(finalInput, "Холболтын алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="w-full max-w-4xl mx-auto p-4 relative z-50">
      <Suggestions visible={history?.length === 0} onSelect={handleSend} />

      <div className="relative flex items-center w-full gap-3 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        <VoiceButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          isLoading={isLoading}
          onStart={() => startRecording((t) => t && handleSend(t))}
          onStop={stopRecording}
        />

        <InputField
          value={input}
          onChange={setInput}
          onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
          disabled={isLoading || isProcessing}
          isProcessing={isProcessing}
        />

        <SendButton
          onClick={() => handleSend()}
          disabled={isLoading || isProcessing || !input.trim()}
          isLoading={isLoading}
        />
      </div>

      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-red-500 font-medium animate-bounce">
          Яриаг сонсож байна...
        </div>
      )}
    </footer>
  );
}
