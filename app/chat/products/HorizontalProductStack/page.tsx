"use client";

import { useState, useCallback, useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./components/ProductCard";
// ✅ Өөрийнхөө зассан ProductCard-ыг зөв замаас нь импортлоорой

interface Product {
  id: string;
  name: string;
  price: any;
  image: string;
  description: string;
  storeId?: string;
}

interface HorizontalProductStackProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onSave: (productId: string) => void;
  onBuy: (name: string, price: string) => void;
  savedIds?: string[];
}

export function HorizontalProductStack({
  products,
  onSelect,
  onSave,
  onBuy,
  savedIds = [],
}: HorizontalProductStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastNavigationTime = useRef(0);

  const navigate = useCallback((newDirection: number) => {
    const now = Date.now();
    if (now - lastNavigationTime.current < 250) return;
    lastNavigationTime.current = now;

    setCurrentIndex((prev) => {
      if (newDirection > 0) return prev === products.length - 1 ? 0 : prev + 1;
      return prev === 0 ? products.length - 1 : prev - 1;
    });
  }, [products.length]);

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

    if (diff === 0) return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0 };
    if (Math.abs(diff) === 1)
      return {
        x: diff * (typeof window !== "undefined" && window.innerWidth < 768 ? 160 : 220),
        scale: 0.8, opacity: 0.4, zIndex: 5, rotateY: diff * -15,
      };
    return { x: diff > 0 ? 600 : -600, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <div className="relative flex h-[550px] w-full items-center justify-center overflow-visible">
      {/* Navigation Buttons */}
      <div className="absolute left-2 md:left-6 z-[60]">
        <button onClick={() => navigate(-1)} className="p-4 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:text-[#C5A059] transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: "1200px" }}>
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
              style={{ zIndex: style.zIndex }}
            >
              {/* ✅ ЭНД ХУУЧИН DIV-ИЙН ОРОНД ЗАССАН КОМПОНЕНТОО АШИГЛАВ */}
              <ProductCard 
                product={product}
                isCurrent={isCurrent}
                onSelect={onSelect}
                onSave={onSave}
                onOrder={() => onBuy(product.name, product.price)}
                onShare={(id: string) => console.log("Share", id)}
                onAddToCart={(p: any) => console.log("Add to cart", p)}
                savedIds={savedIds}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="absolute right-2 md:right-6 z-[60]">
        <button onClick={() => navigate(1)} className="p-4 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:text-[#C5A059] transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default HorizontalProductStack;