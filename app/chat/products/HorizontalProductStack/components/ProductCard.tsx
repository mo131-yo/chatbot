"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ShoppingBag, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/chat/hooks/useCart";

export const ProductCard = ({
  product,
  isCurrent,
  onSelect,
  onSave,
  onOrder,
  onShare,
  onAddToCart,
  savedIds,
}: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const productId = product.id ?? product.product_id ?? product.name;
  const productWithImage = { ...product, image: imageUrl || product.image };

  useEffect(() => {
    const getProductImage = async () => {
      setLoading(true);
      const existingImg =
        product.product_image_url || product.image || product.image_url;
      if (existingImg && existingImg.startsWith("http")) {
        setImageUrl(existingImg);
        setLoading(false);
        return;
      }
      try {
        const query = product.product_name || product.name || "product";
        const response = await fetch(
          `/api/search-image?q=${encodeURIComponent(query)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
        } else {
          setImageUrl(
            `https://loremflickr.com/800/800/${encodeURIComponent(query)}`,
          );
        }
      } catch {
        setImageUrl(`https://loremflickr.com/800/800/shopping`);
      } finally {
        setLoading(false);
      }
    };
    getProductImage();
  }, [product.name, product.id]);

  return (
    <div
      className={`relative mx-auto flex flex-col h-[480px] w-72 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "border-white/5"
      }`}
    >
      <div className="relative h-[280px] w-full overflow-hidden shrink-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-white/5 animate-pulse">
            <ImageIcon className="text-white/20" size={40} />
          </div>
        ) : (
          <img
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSelect?.(productWithImage)}
            src={imageUrl || "/default-product.png"}
            alt={product.product_name || product.name}
            className="h-full w-full object-cover select-none cursor-pointer hover:scale-105 transition-transform duration-500"
          />
        )}

        <div className="absolute top-4 right-4 z-20">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSave?.(product);
            }}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
          >
            <Heart
              size={18}
              className={
                savedIds?.includes(product.id)
                  ? "text-red-500 fill-red-500"
                  : "text-white"
              }
            />
          </button>
        </div>
      </div>

      <ProductCard product={product} onAddToCart={addToCart} />

      <div className="flex flex-col flex-1 p-6 justify-between bg-[#121212]">
        <div>
          <h3 className="text-white text-lg font-bold leading-snug line-clamp-2 mb-2">
            {product.product_name || product.name}
          </h3>
          <p className="text-[#C5A059] text-xl font-black">
            {(() => {
              const rawPrice = product.price ?? product.formatted_price ?? 0;
              const numericPrice = parseFloat(
                String(rawPrice).replace(/[^0-9.]/g, ""),
              );
              return isNaN(numericPrice)
                ? "Үнэгүй"
                : numericPrice.toLocaleString() + "₮";
            })()}
          </p>
        </div>

        <div className="h-13">
          <AnimatePresence>
            {isCurrent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2"
              >
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onOrder?.(productWithImage);
                  }}
                  className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-black font-bold active:scale-95 transition-all text-sm"
                >
                  Захиалах
                </button>

                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onAddToCart?.(productWithImage);
                  }}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
                >
                  <ShoppingBag size={18} />
                </button>

                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onShare?.(productId);
                  }}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
                >
                  <Share2 size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
