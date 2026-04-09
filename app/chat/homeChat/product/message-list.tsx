"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";
import OrderAddress from "../../payment/components/form";
import QPayPayment from "../../payment/components/QPayPayment ";
import OrderReceipt from "../../ZahialgaHarah/OrderReceipt";

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

/**
 * 1. Текст доторх ![alt](src) хэлбэртэй Markdown-ийг устгаж цэвэр текст үлдээх
 */
const removeImageMarkdown = (content: string): string => {
  if (!content) return "";
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * 2. Markdown-ий alt text-ээс барааны дэлгэрэнгүй мэдээллийг салгах
 * Бүтэц: ![Name | Price | Description | ID | Brand | StoreID | StoreName](URL)
 */
const extractProducts = (content: string): Product[] => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: Product[] = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const altText = match[1];
    const imageSrc = match[2];
    const parts = altText.split("|").map((p) => p.trim());

    if (parts.length >= 2) {
      products.push({
        name: parts[0] || "Нэргүй бараа",
        price: parts[1] || "0",
        description: parts[2] || "",
        id: parts[3] || `id-${Math.random()}`,
        brand: parts[4] || "",
        storeId: parts[5] || "store-001",
        storeName: parts[6] || "Turuu's store",
        image: imageSrc,
      });
    }
  }
  return products;
};

/**
 * 3. Төлбөрийн триггер болон цэвэрлэгээний функцууд
 */
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
  const [addressFormProduct, setAddressFormProduct] = useState<any>(null);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleAddressConfirm = () => {
    const product = addressFormProduct;
    if (!product) return;

    setAddressFormProduct(null);

    const numericPrice =
      typeof product.price === "string"
        ? parseFloat(product.price.replace(/[^0-9.]/g, ""))
        : product.price;

    setTimeout(() => {
      setActivePayment({
        amount: numericPrice || 0,
        orderId: product.id || `ORD-${Date.now()}`,
        productName: product.name,
        image: product.image,
      });
    }, 300);
  };

  const handlePaymentSuccess = (details: any) => {
    const paidInfo = activePayment;
    setActivePayment(null);

    setReceiptData({
      productName: paidInfo.productName,
      amount: paidInfo.amount,
      orderId: paidInfo.orderId,
      date: new Date().toLocaleString(),
      image: paidInfo.image,
      transactionId: details.transactionId,
    });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto pb-20 flex flex-col space-y-8">
        {messages.map((message: any, index: number) => {
          const isUser = message.role?.toLowerCase() === "user";
          
          // Мессеж бүрээс бараа болон төлбөрийн мэдээллийг салгах
          const products = !isUser ? extractProducts(message.content || "") : [];
          const paymentTrigger = !isUser ? extractPaymentTrigger(message.content || "") : null;
          
          const cleanedContent = paymentTrigger
            ? cleanPaymentTrigger(message.content || "")
            : message.content || "";
            
          const rawText = removeImageMarkdown(cleanedContent);
          const hasText = rawText.length > 0;
          
          const isVisual = !isUser && isVisualSearchReply(messages, index) && products.length > 0;

          const displayImage = message.imagePreview || message.image;
          const isActualImage = displayImage && (displayImage.startsWith("data:image") || displayImage.startsWith("http"));

          return (
            <motion.div
              key={`msg-${index}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
            >
              {isUser ? (
                // --- Хэрэглэгчийн мессеж ---
                <div className="flex flex-col items-end gap-2 max-w-[85%]">
                  {isActualImage && (
                    <img
                      src={displayImage}
                      className="w-full max-w-[320px] rounded-2xl shadow-lg border border-white/5"
                      alt="User upload"
                    />
                  )}
                  {hasText && (
                    <div className="px-5 py-3 rounded-[1.5rem] rounded-tr-sm bg-[#007AFF] text-white font-medium">
                      <ReactMarkdown components={{ img: () => null, p: ({ children }) => <p className="mb-0">{children}</p> }}>
                        {rawText}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                // --- AI-ийн хариулт ---
                <div className="w-full space-y-4">
                  {hasText && (
                    <div className="max-w-[85%] px-5 py-3 rounded-[1.8rem] rounded-tl-sm bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                        <ReactMarkdown components={{ img: () => null, p: ({ children }) => <p className="mb-0">{children}</p> }}>
                          {rawText}
                        </ReactMarkdown>
                      </div>

                      {paymentTrigger && (
                        <button
                          onClick={() => {
                            const match = products.find((p) => p.name === paymentTrigger.name) || products[0];
                            setAddressFormProduct({
                              ...paymentTrigger,
                              image: match?.image || "",
                              id: match?.id || `trig-${Date.now()}`
                            });
                          }}
                          className="mt-4 px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b476] text-black font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                        >
                          🛍️ Захиалах
                        </button>
                      )}
                    </div>
                  )}

                  {/* Барааны жагсаалт (Carousel) */}
                  {products.length > 0 && (
                    <div className="w-full mt-2">
                      {isVisual && (
                        <div className="pl-4 mb-3 text-[11px] font-bold text-[#C5A059] uppercase tracking-widest">
                          Олдсон бараа ({products.length})
                        </div>
                      )}
                      <ProductCarousel
                        products={products}
                        onBuy={onBuy}
                        onSelect={onProductClick}
                        history={[]}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 py-4 px-2">
            <PulsatingDots />
          </div>
        )}
        <div ref={messagesEndRef} className="h-2 w-full" />
      </div>

      {/* --- Popups / Modals --- */}
      <AnimatePresence>
        {addressFormProduct && (
          <OrderAddress
            onClose={() => setAddressFormProduct(null)}
            onConfirm={handleAddressConfirm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePayment && (
          <QPayPayment
            amount={activePayment.amount}
            orderId={activePayment.orderId}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setActivePayment(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptData && (
          <OrderReceipt
            orderData={receiptData}
            onClose={() => setReceiptData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};