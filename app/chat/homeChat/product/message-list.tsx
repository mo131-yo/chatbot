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
  onProductClick: (product: Product) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}
 
const extractProducts = (content: string): Product[] => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: Product[] = [];
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
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      {messages.map((message: any, index: number) => {
        const products = extractProducts(message.content);
        
        const isUser = message.role?.toLowerCase() === "user";
        
        return (
          <motion.div
            key={`msg-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div className={`max-w-[85%] shadow-sm px-5 py-3 rounded-[2rem] ${
              isUser
                ? "bg-[#007AFF] text-white rounded-tr-sm"
                : "bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-tl-sm"
            }`}>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    img: () => null,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
 
            {products.length > 0 && (
              <div className="w-full mt-4 overflow-visible">
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
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 py-4 px-2"
          >
            <div className="bg-white dark:bg-[#161616] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
              <PulsatingDots />
            </div>
            <span className="text-slate-500 text-sm animate-pulse">Түр хүлээнэ үү...</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} className="h-2 w-full" />
    </div>
  );
};