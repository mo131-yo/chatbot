"use client";
import { useRef } from "react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  stock: number;
  color: string;
  size: string;
  category: string;
  brand: string;
}

interface ProductCarouselProps {
  products: Product[];
  onBuy: (name: string, price: string) => void;
  onSelect: (product: Product) => void;
}

export const ProductCarousel = ({
  products,
  onBuy,
  onSelect,
}: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveDistance = clientWidth * 0.5;
      const scrollTo =
        direction === "left"
          ? scrollLeft - moveDistance
          : scrollLeft + moveDistance;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group py-4 px-2">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-4"
      >
        {products.map((product, i) => (
          <div
            key={i}
            className="shrink-0 w-55 md:w-65 snap-center cursor-pointer"
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
                <h3 className="text-white font-bold text-sm truncate">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between pt-2">
                  <span className=" font-black text-base">
                    {product.price}₮
                  </span>

                  <div className="flex gap-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuy(product.name, product.price);
                      }}
                      className="px-3 py-0.5 bg-blue-400 text-black text-[12px] font-black rounded-lg uppercase hover:bg-white transition-all"
                    >
                      Buy
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="px-3 py-0.5 bg-blue-400 text-black text-[12px] font-black rounded-lg uppercase hover:bg-white transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
