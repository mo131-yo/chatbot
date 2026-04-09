"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ShoppingBag, ImageIcon, Store } from "lucide-react";
import { useState, useEffect } from "react";

export const ProductCard = ({ 
  product, isCurrent, onSelect, onSave, onOrder, onShare, onAddToCart, savedIds 
}: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const name = product.product_name || product.name || "Нэргүй бараа";
  const storeName = product.metadata?.store_name || product.store_name || "Official Store";
  const price = product.price ?? product.metadata?.price ?? 0;

  useEffect(() => {
    const getProductImage = async () => {
      setLoading(true);
      const existingImg = product.product_image_url || product.metadata?.product_image_url || product.image;
      
      if (existingImg && existingImg.startsWith('http')) {
        setImageUrl(existingImg);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/search-image?q=${encodeURIComponent(name)}`);
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
        } else {
          setImageUrl(`https://loremflickr.com/800/800/${encodeURIComponent(name)}`);
        }
      } catch (error) {
        setImageUrl(`https://loremflickr.com/800/800/shopping`);
      } finally { 
        setLoading(false);
      }
    };
    getProductImage();
  }, [name, product.id]); 

  return (
    <div
      className={`relative mx-auto flex flex-col h-125 w-72 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "border-white/5"
      }`}
    >
      <div className="relative h-65 w-full overflow-hidden shrink-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-white/5 animate-pulse">
            <ImageIcon className="text-white/20" size={40} />
          </div>
        ) : (
          <img 
            onClick={() => onSelect({ ...product, image: imageUrl })}
            src={imageUrl || '/default-product.png'}
            alt={name}
            className="h-full w-full object-cover select-none cursor-pointer hover:scale-105 transition-transform duration-500"
          />
        )}
        
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(product.id); }}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          >
            <Heart size={18} className={savedIds?.includes(product.id) ? "text-red-500 fill-red-500" : "text-white"} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 justify-between bg-[#121212]">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Store size={12} className="text-[#C5A059]" />
            <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
              {storeName}
            </span>
          </div>

          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
            {name}
          </h3>
          
          <p className="text-[#C5A059] text-xl font-black">
            {parseFloat(String(price)).toLocaleString()}₮
          </p>
        </div>

        <div className="h-14 mt-4"> 
          <AnimatePresence>
            {isCurrent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2"
              >
                <button
                  onClick={() => onOrder({ ...product, image: imageUrl })}
                  className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-black font-bold active:scale-95 transition-all text-sm"
                >
                  Захиалах
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10"
                >
                  <ShoppingBag size={18} />
                </button>
                <button
                  onClick={() => onShare(product.id)}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10"
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