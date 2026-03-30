"use client";

import { useState, useCallback, useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { ShoppingBag, Info, ChevronLeft, ChevronRight } from "lucide-react";

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
}

export function HorizontalProductStack({ products, onSelect, onBuy }: HorizontalProductStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();
  const lastNavigationTime = useRef(0);
  const navigationCooldown = 400;

  if (!products || products.length === 0) return <div className="text-white">Бараа олдсонгүй...</div>;

  const navigate = useCallback((newDirection: number) => {
    const now = Date.now();
    if (now - lastNavigationTime.current < navigationCooldown) return;
    lastNavigationTime.current = now;

    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === products.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? products.length - 1 : prev - 1;
    });
  }, [products.length]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) navigate(1); 
    else if (info.offset.x > threshold) navigate(-1); 
  };

  const getCardStyle = (index: number) => {
    const total = products.length;
    let diff = index - currentIndex;
    
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff === 0) return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0, y: 0 };
    if (Math.abs(diff) === 1) return { x: diff * 220, scale: 0.85, opacity: 0.6, zIndex: 5, rotateY: diff * -15, y: 0 };
    if (Math.abs(diff) === 2) return { x: diff * 380, scale: 0.7, opacity: 0.2, zIndex: 2, rotateY: diff * -25, y: 0 };
    
    return { x: diff > 0 ? 600 : -600, scale: 0.5, opacity: 0, zIndex: 0, rotateY: 0, y: 0 };
  };

  return (
    <div className="relative flex h-[600px] w-full items-center justify-center overflow-hidden bg-transparent">
      <div className="relative flex h-[500px] w-full items-center justify-center" style={{ perspective: "1500px" }}>
        {products.map((product, index) => {
          const style = getCardStyle(index);
          const isCurrent = index === currentIndex;
          if (style.opacity === 0 && !isCurrent) return null;

          return (
            <motion.div
              key={product.id}
              className="absolute"
              animate={style}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              drag={isCurrent ? "x" : false} 
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <div className={`relative group mx-auto h-[450px] w-[300px] overflow-hidden rounded-[2.5rem] bg-[#161616] border transition-colors duration-500 ${isCurrent ? 'border-[#C5A059]/50 shadow-2xl shadow-[#C5A059]/20' : 'border-white/5'}`}>
                
                <div className="relative h-full w-full">
                   <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                </div>

                {isCurrent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 w-full p-6 space-y-3"
                  >
                    <h3 className="text-xl font-bold text-white truncate">{product.name}</h3>
                    <p className="text-[#C5A059] text-2xl font-black">{product.price}₮</p>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-[#C5A059] text-black h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95"
                      >
                        <ShoppingBag size={18} />
                        Нэмэх
                      </button>
                      <button 
                        onClick={() => onSelect(product)}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white"
                      >
                        <Info size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 text-white/40 hover:text-[#C5A059] transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-2">
          {products.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>

        <button onClick={() => navigate(1)} className="p-2 text-white/40 hover:text-[#C5A059] transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}