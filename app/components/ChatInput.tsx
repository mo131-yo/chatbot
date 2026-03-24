"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Send, Loader2 } from "lucide-react";
import { useVoiceToText } from "../hooks/useVoiceToText";

interface ChatInputProps {
  onMessageReceived: (userMessage: string, aiReply: string) => void;
  history: { role: string; content: string }[];
  setIsTyping: (val: boolean) => void;
}

export const ChatInput = ({
  onMessageReceived,
  history,
  setIsTyping,
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isRecording, isProcessing, startRecording, stopRecording } =
    useVoiceToText();

  const suggestions = [
    { label: "Шинэ номнууд 📚", query: "Шинээр ирсэн ямар гоё номнууд байна?" },
    { label: "Хямд бараа 💰", query: "20,000 төгрөгөөс хямд бараанууд харуул" },
    {
      label: "Төлбөрийн заавар 💳",
      query: "Төлбөрөө яаж төлөх вэ? Дансны дугаар өгөөч",
    },
    {
      label: "Бэлэгний санаа 🎁",
      query: "Найздаа бэлэглэх гоё ном санал болгооч",
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const finalInput = textToSend || input;

    if (!finalInput.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
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
      if (data.reply) {
        onMessageReceived(finalInput, data.reply);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      onMessageReceived(finalInput, "Холболтын алдаа гарлаа.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleVoiceReceived = (text: string) => {
    if (text.trim()) {
      handleSend(text);
    }
  };

  return (
    <footer className="w-full max-w-4xl mx-auto p-4 relative">
      {history.length === 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {suggestions.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              onClick={() => handleSend(item.query)}
              className="px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-[#007AFF] dark:hover:border-[#C5A059] text-slate-600 dark:text-slate-300 text-xs md:text-sm rounded-full transition-all shadow-sm"
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      )}

      <div className="relative flex items-center w-full gap-3 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        <button
          type="button"
          onMouseDown={() => startRecording(handleVoiceReceived)}
          onMouseUp={stopRecording}
          onTouchStart={() => startRecording(handleVoiceReceived)}
          onTouchEnd={stopRecording}
          disabled={isProcessing || isLoading}
          className={`p-4 rounded-xl transition-all flex items-center justify-center ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-white/5 text-slate-400 hover:text-white"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isRecording ? (
            <Square size={20} fill="currentColor" />
          ) : (
            <Mic size={20} />
          )}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent py-3 px-2 outline-none text-sm dark:text-white"
          placeholder={
            isProcessing
              ? "Дууг хөрвүүлж байна..."
              : "Юу худалдаж авмаар байна?"
          }
          disabled={isLoading || isProcessing}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || isProcessing || !input.trim()}
          className="p-3 bg-[#C5A059] text-black rounded-xl hover:bg-[#d4b57a] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {isRecording && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-red-500 font-medium animate-bounce">
          Яриаг сонсож байна...
        </div>
      )}
    </footer>
  );
};
