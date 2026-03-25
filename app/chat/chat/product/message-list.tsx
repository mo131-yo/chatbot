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
}

export const MessageList = ({ 
  messages, 
  isTyping, 
  onProductClick, 
  onBuy, 
  messagesEndRef 
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

                      const products = imageElements.map((img: any) => {
                        const [name, price] = (img.props.alt || "").split(",");
                        return {
                          name: name || "Нэргүй бараа",
                          price: price || "Үнэ тодорхойгүй",
                          image: img.props.src,
                          description: "" 
                        };
                      });

                      return (
                        <div className="flex flex-col gap-4 w-full my-2">
                          {textElements.length > 0 && (
                            <div className="text-slate-700 dark:text-slate-200 leading-relaxed px-1">
                              {textElements}
                            </div>
                          )}
                          <ProductCarousel 
                            products={products} 
                            onBuy={onBuy} 
                            onSelect={onProductClick} 
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