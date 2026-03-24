"use client";
import React, { useRef } from "react";

interface Product {
  name: string;
  price: string;
  image: string;
  description: string;
}

interface ProductCarouselProps {
  products: Product[];
  onBuy: (name: string, price: string) => void;
  onSelect: (product: Product) => void;
}

export const ProductCarousel = ({ products, onBuy, onSelect }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveDistance = clientWidth * 0.5;
      const scrollTo = direction === "left" ? scrollLeft - moveDistance : scrollLeft + moveDistance;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group py-4 px-2">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-4"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[220px] md:w-[260px] snap-center cursor-pointer"
            onClick={() => onSelect(product)}
          >
            <div className="relative group/card rounded-2xl overflow-hidden bg-[#161616] border border-white/5 shadow-xl transition-all duration-300 hover:border-[#C5A059]/40">
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-white font-bold text-sm truncate">{product.name}</h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#C5A059] font-black text-sm">{product.price}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy(product.name, product.price);
                    }}
                    className="px-3 py-1.5 bg-[#C5A059] text-black text-[10px] font-black rounded-lg uppercase hover:bg-white transition-all"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};