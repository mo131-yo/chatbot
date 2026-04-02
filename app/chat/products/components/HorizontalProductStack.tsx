"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import {
  ShoppingBag,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { sendOrderEmail } from "@/lib/service/email";
import { useRouter } from "next/navigation";
import LocationForm from "../../payment/components/form";
import QPayPayment from "../../payment/components/QPayPayment ";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
}

interface HorizontalProductStackProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onBuy: (name: string, price: string) => void;
  onSave: (productId: string) => void;
  savedIds?: string[];
}

export function HorizontalProductStack({
  products,
  onSelect,
  onBuy,
  onSave,
  savedIds = [],
}: HorizontalProductStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();
  const lastNavigationTime = useRef(0);
  const [isShared, setIsShared] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const navigate = useCallback(
    (newDirection: number) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < 250) return;
      lastNavigationTime.current = now;

      setCurrentIndex((prev) => {
        if (newDirection > 0)
          return prev === products.length - 1 ? 0 : prev + 1;
        return prev === 0 ? products.length - 1 : prev - 1;
      });
    },
    [products.length],
  );

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    // setShowPayment(true);
    setShowLocationForm(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 40;
    if (info.offset.x < -threshold) navigate(1);
    else if (info.offset.x > threshold) navigate(-1);
  };

  const getCardStyle = (index: number) => {
    const total = products.length;
    let diff = index - currentIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff === 0)
      return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0 };
    if (Math.abs(diff) === 1)
      return {
        x:
          diff *
          (typeof window !== "undefined" && window.innerWidth < 768
            ? 140
            : 200),
        scale: 0.8,
        opacity: 0.3,
        zIndex: 5,
        rotateY: diff * -15,
      };

    return { x: diff > 0 ? 500 : -500, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  const handleShare = async (chatId: string) => {
    const shareData = {
      title: "Чат хуваалцах",
      text: "Энэхүү сонирхолтой яриаг үзээрэй!",
      url: `${window.location.origin}/chat/${chatId}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("Амжилттай хуваалцлаа");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Холбоосыг хууллаа!");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Хэрэглэгч хуваалцахыг цуцаллаа.");
        return;
      }
      console.error("Хуваалцахад алдаа гарлаа:", error);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    if (!user) {
      console.error("Хэрэглэгч нэвтрээгүй байна");
      return;
    }

    try {
      const orderData = {
        id: details.transactionId || `INV-${Math.floor(Math.random() * 10000)}`,
        amount: details.amount,
      };

      const orderItems = [
        {
          name: selectedProduct?.name || "Бүтээгдэхүүн",
          quantity: 1,
          price: Number(selectedProduct?.price.replace(/,/g, "")),
          thumbnail: selectedProduct?.image,
        },
      ];

      const emailSent = await sendOrderEmail(user, orderData, orderItems);

      if (emailSent) {
        console.log("Баталгаажуулах имэйл амжилттай илгээгдлээ.");
      }

      setTimeout(() => {
        setShowPayment(false);
      }, 2500);
    } catch (error) {
      console.error("Төлбөрийн дараах үйлдлүүдэд алдаа гарлаа:", error);
    }
  };

  return (
    <div className="relative flex h-137.5 w-full items-center justify-center overflow-visible bg-transparent group select-none touch-none">
      <AnimatePresence>
        {showLocationForm && (
          <LocationForm onClose={() => setShowLocationForm(false)} />
        )}
        {showPayment && selectedProduct && (
          <div className="fixed inset-0 z-100 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10"
            >
              <QPayPayment
                amount={Number(selectedProduct.price.replace(/,/g, ""))}
                orderId={`INV-${Math.floor(Math.random() * 10000)}`}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute left-2 md:left-6 z-50 transition-all duration-300">
        <button
          onClick={() => navigate(-1)}
          className="p-3 md:p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-[#C5A059] hover:border-[#C5A059]/50 hover:bg-white/10 active:scale-90 transition-all shadow-2xl"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
        </button>
      </div>

      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {products.map((product, index) => {
          const style = getCardStyle(index);
          const isCurrent = index === currentIndex;
          if (style.opacity === 0 && !isCurrent) return null;

          return (
            <motion.div
              key={`${product.id}-${index}`}
              className="absolute"
              animate={style}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <div
                className={`relative mx-auto h-105 w-70 md:h-120 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
                  isCurrent
                    ? "border-[#C5A059] shadow-[0_0_50px_rgba(197,160,89,0.2)]"
                    : "border-white/5 shadow-none"
                }`}
              >
                <div className="h-full w-full relative group overflow-hidden rounded-3xl">
                  <img
                    onClick={() => onSelect(product)}
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave(product.id);
                      }}
                      className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:border-white/40 hover:scale-110 active:scale-90 transition-all duration-300 group/heart"
                    >
                      <Heart
                        size={20}
                        className={`transition-colors duration-300 ${
                          savedIds.includes(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-white group-hover/heart:text-red-400"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white text-lg font-bold truncate">
                      {product.name}
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-[#C5A059] text-xl font-black">
                        {product.price}₮
                      </p>
                      <span className="text-white/40 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity underline">
                        Дэлгэрэнгүй
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-0 w-full p-6 space-y-3 bg-linear-to-t from-black to-transparent"
                    >
                      <h3 className="text-xl font-bold text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-[#C5A059] text-2xl font-black">
                        {product.price}₮
                      </p>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleOrderClick(product)}
                          className="flex-1 h-12 bg-[#C5A059] border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold active:scale-95 transition-transform"
                        >
                          Захиалах
                        </button>
                        <button
                          onClick={() => handleShare(product.id)}
                          className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:border-[#C5A059] hover:bg-[#C5A059]/20 active:scale-90 transition-all"
                        >
                          <Share2 size={20} className="text-white" />
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-[#C5A059] text-black h-12 w-12 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <ShoppingBag size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="absolute right-2 md:right-6 z-50 transition-all duration-300">
        <button
          onClick={() => navigate(1)}
          className="p-3 md:p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-[#C5A059] hover:border-[#C5A059]/50 hover:bg-white/10 active:scale-90 transition-all shadow-2xl"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/5">
        {products.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              i === currentIndex ? "w-8 bg-[#C5A059]" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
