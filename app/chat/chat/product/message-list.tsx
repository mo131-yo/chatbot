"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  onProductClick: (product: any) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onOptionClick?: (option: string) => void;
}

export const MessageList = ({ 
  messages, 
  isTyping, 
  onProductClick, 
  onBuy, 
  onOptionClick,
  messagesEndRef,
}: MessageListProps) => {

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={`msg-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className={`max-w-[85%] shadow-sm px-5 py-3 rounded-[2rem] ${
            message.role === "user" 
              ? "bg-[#007AFF] text-white rounded-tr-sm" 
              : "bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/5 rounded-tl-sm"
          }`}>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => {
                    const childrenArray = React.Children.toArray(children);
                    
                    const hasImage = childrenArray.some((child: any) => 
                      child.type === 'img' || (child.props && child.props.src)
                    );

                    if (hasImage) {
                      const imageElements = childrenArray.filter((c: any) => c.type === 'img' || (c.props && c.props.src));
                      const textElements = childrenArray.filter((c: any) => c.type !== 'img' && !(c.props && c.props.src));

                     const products = imageElements.map((img: any, idx: number) => {
                      const altText = img.props.alt || "";
                      const parts = altText.split(",");
                      
                      const name = parts[0]?.trim() || "Нэргүй";
                      const price = parts[1]?.trim() || "0";
                      const description = parts[2]?.trim() || "";
                      const realId = parts[3]?.trim(); 
                      const storeId = parts[4]?.trim();

                      const imageSrc = img.props.src?.startsWith('http') 
                        ? img.props.src 
                        : `https://placehold.co/300x400?text=No+Image`;
                      return {
                        id: realId || `temp-${idx}`,
                        name,
                        price,
                        image: imageSrc,
                        description,
                        storeId: storeId || `store-${idx}`
                      };
                      });

                      return (
                        <div className="flex flex-col gap-4 w-full my-2">
                          <ProductCarousel 
                            products={products} 
                            onBuy={onBuy} 
                            onSelect={onProductClick}
                            history={[]}
                          />
                        </div>
                      );
                    }
                    return <div className="mb-4 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>;
                  },
                  img: () => null 
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {isTyping && (
          <motion.div 
          key="loading-indicator"
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }} 
          className="flex items-center gap-3 py-4 px-2"
          >
            <div className="bg-white dark:bg-[#161616] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center">
              <PulsatingDots />
            </div>
            <span className="text-slate-500 text-sm font-medium animate-pulse">Түр хүлээнэ үү...</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} className="h-2 w-full" />
    </div>
  );
};