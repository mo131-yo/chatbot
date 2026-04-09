"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ShoppingBag, ImageIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/chat/hooks/useCart";

export const ProductCard = ({
  product,
  isCurrent,
  onSelect,
  onSave,
  onOrder,
  onAddToCart,
  savedIds,
}: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { addToCart } = useCart();

  const productId = product.id ?? product.product_id ?? product.name;
  const name = product.product_name || product.name || "Нэргүй бараа";
  const productWithImage = { ...product, image: imageUrl || product.image };

  useEffect(() => {
    const pineconeImage =
      product.product_image_url || product.image_url || product.image || null;

    if (pineconeImage && pineconeImage.startsWith("http")) {
      setImageUrl(pineconeImage);
    } else {
      setImageUrl(null);
    }
    setImgError(false);
  }, [product.id, product.name]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isSharing) return;

    const shareUrl = `${window.location.origin}/product/${productId}`;
    const shareData = {
      title: name,
      text: `${name} - Хамгийн ухаалаг AI дэлгүүрээс сонирхоорой!`,
      url: shareUrl,
    };

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Share үйлдлийг хэрэглэгч цуцаллаа.");
      } else {
        console.error("Share error:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={`relative mx-auto flex flex-col h-125 w-72 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "border-white/5"
      }`}
    >
      <div className="relative h-65 w-full overflow-hidden shrink-0">
        {imageUrl && !imgError ? (
          <img
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSelect?.(productWithImage)}
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover select-none cursor-pointer hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="h-full w-full flex flex-col items-center justify-center bg-white/5 cursor-pointer"
            onClick={() => onSelect?.(productWithImage)}
          >
            <ImageIcon className="text-white/20 mb-2" size={40} />
            <span className="text-white/20 text-xs">Зураг байхгүй</span>
          </div>
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

      <div className="flex flex-col flex-1 p-6 justify-between bg-[#121212]">
        <div>
          <h3 className="text-white text-lg font-bold leading-snug line-clamp-2 mb-2">
            {name}
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
          <AnimatePresence mode="wait">
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
                  onClick={handleShare}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                    isShared
                      ? "bg-green-500/20 border-green-500 text-green-500"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {isShared ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
