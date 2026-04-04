"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ShoppingBag } from "lucide-react";

export const ProductCard = ({ 
  product, isCurrent, onSelect, onSave, onOrder, onShare, onAddToCart, savedIds 
}: any) => {
  return (
    <div
      className={`relative mx-auto h-105 w-70 md:h-120 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#C5A059] shadow-[0_0_50px_rgba(197,160,89,0.2)]"
          : "border-white/5 shadow-none"
      }`}
    >
      <div className="h-full w-full relative group overflow-hidden">
        <img
          onClick={() => onSelect(product)}
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(product.id); }}
            className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 transition-all"
          >
            <Heart
              size={20}
              className={savedIds.includes(product.id) ? "text-red-500 fill-red-500" : "text-white"}
            />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-white text-lg font-bold truncate">{product.name}</p>
          <p className="text-[#C5A059] text-xl font-black">{product.price}₮</p>
        </div>
      </div>

      <AnimatePresence>
        {isCurrent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 w-full p-6 space-y-3 bg-gradient-to-t from-black to-transparent"
          >
            <div className="flex gap-2.5">
              <button
                onClick={() => onOrder(product)}
                className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-white font-bold active:scale-95 transition-transform"
              >
                Захиалах
              </button>
              <button
                onClick={() => onShare(product.id)}
                className="p-3 rounded-full bg-black/30 border border-white/10 text-white hover:bg-[#C5A059]/20"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={() => onAddToCart(product)}
                className="bg-[#C5A059] text-black h-12 w-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
              >
                <ShoppingBag size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};