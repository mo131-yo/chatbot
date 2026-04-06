"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import HorizontalProductStrip from "../../products/HorizontalProductStack/page";

const extractProducts = (content: string) => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: any[] = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const parts = match[1].split(",");
    const src = match[2];
    products.push({
      id: parts[3]?.trim() || `temp-${Math.random()}`,
      product_name: parts[0]?.trim() || "Нэргүй",
      name: parts[0]?.trim() || "Нэргүй",
      formatted_price: parts[1]?.trim() || "0",
      price: parts[1]?.trim() || "0",
      description: parts[2]?.trim() || "",
      image: src.startsWith("http") ? src : "",
      storeId: parts[4]?.trim() || "store-default",
    });
  }
  return products;
};

const cleanText = (content: string) =>
  content.replace(/!\[[^\]]*\]\([^)]*\)/g, "").trim();


const TypingDots = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    transition={{ duration: 0.15 }}
    className="flex justify-start"
  >
    <div className="bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-[1.5rem] rounded-tl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm">
      {[0, 150, 300].map((delay, i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-[#C5A059] rounded-full block"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: delay / 1000,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);


const StreamCursor = () => (
  <motion.span
    className="inline-block w-0.5 h-[1.1em] bg-[#C5A059] align-middle ml-0.5 rounded-full"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
  />
);


const AssistantBubble = ({
  content,
  isStreaming,
  onSelect,
  onBuy,
}: {
  content: string;
  isStreaming: boolean;
  onSelect: (p: any) => void;
  onBuy: (name: string, price: any) => void;
}) => {
  const text = cleanText(content);
  const products = extractProducts(content);

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      {text && (
        <div className="bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-[1.5rem] rounded-tl-sm px-5 py-3 shadow-sm max-w-[85%]">
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                img: () => null,
                p: ({ children }) => (
                  <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
            {isStreaming && <StreamCursor />}
          </div>
        </div>
      )}

      {!isStreaming && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full"
        >
          <HorizontalProductStrip
            products={products}
            onSelect={onSelect}
            onBuy={onBuy}
          />
        </motion.div>
      )}
    </div>
  );
};


interface MessageListProps {
  messages: any[];
  isTyping: boolean;     
  isStreaming?: boolean; 
  streamingContent?: string;
  onProductClick: (product: any) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  isStreaming = false,
  streamingContent = "",
  onProductClick,
  onBuy,
  messagesEndRef,
}) => {
  const prevContentLen = useRef(0);
  useEffect(() => {
    if (streamingContent.length > prevContentLen.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevContentLen.current = streamingContent.length;
  }, [streamingContent, messagesEndRef]);

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-4 px-4">
      {messages.map((message, index) => {
        const isUser = message.role?.toLowerCase() === "user";
        const isImageMsg =
          typeof message.content === "object" && message.content?.type === "image";
        const isLastAssistant =
          !isUser && index === messages.length - 1;

        const displayContent = isLastAssistant && isStreaming && streamingContent
          ? streamingContent
          : typeof message.content === "string"
          ? message.content
          : "";

        return (
          <motion.div
            key={`msg-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            {isUser ? (
              <div className="max-w-[75%] flex flex-col items-end gap-2">
                {isImageMsg ? (
                  <div className="rounded-[1.5rem] rounded-tr-sm overflow-hidden shadow-lg border border-white/10">
                    <img
                      src={message.content.content}
                      alt="Илгээсэн зураг"
                      className="w-56 h-auto object-cover"
                    />
                  </div>
                ) : (
                  message.imagePreview ? (
                    <div className="rounded-[1.5rem] rounded-tr-sm overflow-hidden shadow-lg border border-white/10">
                      <img
                        src={message.imagePreview}
                        alt="Илгээсэн зураг"
                        className="w-56 h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#007AFF] text-white rounded-[1.5rem] rounded-tr-sm px-5 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed">{displayContent}</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <AssistantBubble
                content={displayContent}
                isStreaming={isLastAssistant && isStreaming}
                onSelect={onProductClick}
                onBuy={onBuy}
              />
            )}
          </motion.div>
        );
      })}

      <AnimatePresence>
        {isTyping && !isStreaming && (
          <TypingDots />
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
};