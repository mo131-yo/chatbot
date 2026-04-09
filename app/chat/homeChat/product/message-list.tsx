"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";
import OrderAddress from "../../payment/components/form";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
}

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  onProductClick: (product: Product) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}


const removeImageMarkdown = (content: string): string => {
  if (!content) return "";
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractProducts = (content: string): Product[] => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: Product[] = [];
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(content)) !== null) {
    const altText = match[1];
    const imageSrc = match[2];

    // Split by pipe character
    // Format: ![Нэр|Үнэ|Тайлбар|ProductID|Brand|StoreID|StoreName](Image_URL)
    const parts = altText.split("|").map((p) => p.trim());

    if (parts.length >= 2) {
      products.push({
        id: parts[3] || `id-${Math.random()}`,
        name: parts[0] || "Нэргүй бараа",
        price: parts[1] || "0",
        image: imageSrc,
        description: parts[2] || "",
        brand: parts[4] || "",
        storeId: parts[5] || "store-001",
        // ✅ StoreName - Markdown-аас parts[6]
        // Pinecone metadata дээр байгаа "Turuu's store" гээх store_name автоматаар ирнэ
        storeName: parts[6] && parts[6].trim() ? parts[6].trim() : "Official Store",
      });
    }
  }
  return products;
};

const extractPaymentTrigger = (content: string) => {
  const match = content.match(/PAYMENT_TRIGGER:(\{[^}]+\})/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const cleanPaymentTrigger = (content: string): string => {
  return content.replace(/PAYMENT_TRIGGER:\{[^}]+\}/g, "").trim();
};

function isVisualSearchReply(messages: any[], index: number): boolean {
  if (index === 0) return false;
  const prev = messages[index - 1];
  return (
    prev?.role?.toLowerCase() === "user" &&
    (!!prev?.imagePreview || !!prev?.image)
  );
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  onProductClick,
  onBuy,
  messagesEndRef,
}) => {
  const [orderProduct, setOrderProduct] = useState<any>(null);

  return (
    <>
      <div className="max-w-3xl mx-auto pb-20 flex flex-col space-y-8">
        {messages.map((message: any, index: number) => {
          const isUser = message.role?.toLowerCase() === "user";
          const products = !isUser
            ? extractProducts(message.content || "")
            : [];

          const displayImage = message.imagePreview || message.image;
          const isActualImage =
            displayImage &&
            (displayImage.startsWith("data:image") ||
              displayImage.startsWith("http") ||
              displayImage.startsWith("/"));

          const paymentTrigger = !isUser
            ? extractPaymentTrigger(message.content || "")
            : null;

          const cleanedContent = paymentTrigger
            ? cleanPaymentTrigger(message.content || "")
            : message.content || "";

          const rawText = removeImageMarkdown(cleanedContent);
          const hasText = rawText.length > 0;
          const isVisual =
            !isUser &&
            isVisualSearchReply(messages, index) &&
            products.length > 0;

          return (
            <motion.div
              key={`msg-${index}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
            >
              {isUser ? (
                <div className="flex flex-col items-end gap-2 max-w-[85%]">
                  {isActualImage && (
                    <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/5 bg-[#1e1e1e] transition-transform hover:scale-[1.02]">
                      <img
                        src={displayImage}
                        alt="User Upload"
                        className="w-full h-auto max-w-[320px] object-cover max-h-80 rounded-2xl block"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  )}

                  {hasText && (
                    <div className="px-5 py-3 rounded-[1.5rem] rounded-tr-sm bg-[#007AFF] text-white shadow-sm font-medium">
                      <ReactMarkdown
                        components={{
                          img: () => null,
                          p: ({ children }) => (
                            <p className="mb-0">{children}</p>
                          ),
                        }}
                      >
                        {rawText}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {hasText && (
                    <div className="max-w-[85%] px-5 py-3 rounded-[1.8rem] rounded-tl-sm bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                        <ReactMarkdown
                          components={{
                            img: () => null,
                            p: ({ children }) => (
                              <p className="mb-0">{children}</p>
                            ),
                          }}
                        >
                          {rawText}
                        </ReactMarkdown>
                      </div>

                      {paymentTrigger && (
                        <button
                          onClick={() => setOrderProduct(paymentTrigger)}
                          className="mt-4 px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b476] text-black font-bold rounded-xl transition-all text-sm"
                        >
                          🛍️ Захиалах
                        </button>
                      )}
                    </div>
                  )}

                  {products.length > 0 && (
                    <div className="w-full mt-2">
                      {isVisual && (
                        <div className="pl-4 mb-3 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                          <span className="text-[11px] font-bold tracking-widest text-[#C5A059] uppercase">
                            Олдсон бараа ({products.length})
                          </span>
                        </div>
                      )}

                      <div className="w-full overflow-visible">
                        <ProductCarousel
                          products={products}
                          onBuy={onBuy}
                          onSelect={onProductClick}
                          history={[]}
                        />
                      </div>
                    </div>
                  )}
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
              <span className="text-slate-500 text-sm animate-pulse">
                Түр хүлээнэ үү...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2 w-full" />
      </div>

      <AnimatePresence>
        {orderProduct && (
          <OrderAddress
            onClose={() => setOrderProduct(null)}
            onConfirm={() => setOrderProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};