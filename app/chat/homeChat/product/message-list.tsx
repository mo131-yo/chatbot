"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
}

interface LocalChatMessage {
  role: string; 
  content: string;
}

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  onProductClick: (product: any) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const extractProducts = (content: string) => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: any[] = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const altText = match[1];
    const imageSrc = match[2];
    const parts = altText.split(",");

    products.push({
      id: parts[3]?.trim() || `temp-${Math.random()}`,
      name: parts[0]?.trim() || "Нэргүй",
      price: parts[1]?.trim() || "0",
      image: imageSrc.startsWith('http') ? imageSrc : `https://placehold.co/300x400?text=No+Image`,
      description: parts[2]?.trim() || "",
      storeId: parts[4]?.trim() || "store-1"
    });
  }
  return products;
};

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping, 
  onProductClick, 
  onBuy, 
  messagesEndRef 
}) => {
  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6 px-4">
      {messages.map((message, index) => {
        const isUser = message.role?.toLowerCase() === "user";
        const isImageMessage = typeof message.content === 'object' && message.content?.type === 'image';
        const products = typeof message.content === 'string' ? extractProducts(message.content) : [];

        return (
          <motion.div
            key={`msg-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div className={`max-w-[85%] shadow-sm overflow-hidden ${
              isUser 
                ? "bg-[#007AFF] text-white rounded-[2rem] rounded-tr-sm px-5 py-3" 
                : "bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-[2rem] rounded-tl-sm px-5 py-3"
            } ${isImageMessage ? "p-1 bg-transparent border-none shadow-none" : ""}`}>
              
              <div className="prose dark:prose-invert max-w-none">
                {isImageMessage ? (
                  <img 
                    src={message.content.content} 
                    alt="Uploaded" 
                    className="w-64 h-auto rounded-2xl border shadow-lg object-cover"
                  />
                ) : (
                  <ReactMarkdown
                    components={{
                      img: () => null,
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                    }}
                  >
                    {typeof message.content === 'string' ? message.content : ""}
                  </ReactMarkdown>
                )}
              </div>
            </div>

            {products.length > 0 && (
              <div className="w-full mt-4">
                <ProductCarousel 
                  products={products} 
                  onBuy={onBuy} 
                  onSelect={onProductClick}
                  history={[]}
                />
              </div>
            )}
          </motion.div>
        );
      })}
      
      <AnimatePresence mode="wait">
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start items-center space-x-2 ml-2"
          >
            <div className="bg-white dark:bg-[#161616] rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center border dark:border-white/5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce [animation-duration:0.6s]" />
              <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.3s]" />
              <span className="text-xs text-slate-500 ml-2 font-medium">AI хариу бичиж байна...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} className="h-4 w-full" />
    </div>
  );
};