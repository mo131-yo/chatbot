"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ShoppingBag, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

export const ProductCard = ({ 
  product, isCurrent, onSelect, onSave, onOrder, onShare, onAddToCart, savedIds 
}: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const getProductImage = async () => {
    setLoading(true);
    
    const existingImg = product.product_image_url || product.image || product.image_url;
    if (existingImg && existingImg.startsWith('http')) {
      setImageUrl(existingImg);
      setLoading(false);
      return;
    }

    try {
      const query = product.product_name || product.name || "product";
      const response = await fetch(`/api/search-image?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
      } else {
        setImageUrl(`https://loremflickr.com/800/800/${encodeURIComponent(query)}`);
      }
    } catch (error) {
      setImageUrl(`https://loremflickr.com/800/800/shopping`);
    } finally { 
      setLoading(false);
    }
  };

  getProductImage();
}, [product.name, product.id]); 

  return (
    <div
      className={`relative mx-auto h-105 w-70 md:h-120 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#C5A059] shadow-[0_0_50px_rgba(197,160,89,0.2)]"
          : "border-white/5 shadow-none"
      }`}
    >
      <div className="h-full w-full relative group overflow-hidden">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-white/5 animate-pulse">
            <ImageIcon className="text-white/20" size={40} />
          </div>
        ) : (
          <img onClick={() => {
            onSelect({ ...product, image: imageUrl || product.image });
          }}
          src={imageUrl || '/default-product.png'}
          alt={product.name}
          className="h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />

        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(product.id); }}
            className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 transition-all"
          >
            <Heart
              size={20}
              className={savedIds?.includes(product.id) ? "text-red-500 fill-red-500" : "text-white"}
            />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-4">
          <div className="transition-all duration-500">
            <p className="text-white text-lg font-bold line-clamp-2 leading-tight mb-1">
              {product.product_name || product.name}
            </p>
          <p className="text-[#C5A059] text-xl font-black">
            {(() => {
              const rawPrice = product.price ?? product.formatted_price ?? 0;
              
              const numericString = String(rawPrice).replace(/[^0-9.]/g, "");
              const numericPrice = parseFloat(numericString);

              if (isNaN(numericPrice) || numericPrice === 0) {
                return "Үнэ тодорхойгүй";
              }

              return numericPrice.toLocaleString() + "₮";
            })()}
          </p>
          </div>

          <AnimatePresence>
            {isCurrent && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex gap-2.5 overflow-hidden"
              >
                <button
                onClick={() => onOrder({ ...product, image: imageUrl || product.image })}
                className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-white font-bold active:scale-95 transition-transform shadow-lg">
                  Захиалах
                 </button>
                <button
                  onClick={() => onShare(product.id)}
                  className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-[#C5A059]/20 transition-colors"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-[#C5A059] text-black h-12 w-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-lg"
                >
                  <ShoppingBag size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};