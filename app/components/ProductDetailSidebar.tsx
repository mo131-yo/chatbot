"use client";
import React from "react";
import { X, ShoppingBag } from "lucide-react";

export function ProductDetailSidebar({ product, onClose, onBuy }: any) {
  if (!product) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-[#111111] border-l border-white/10 z-[100] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Дэлгэрэнгүй</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/20 mb-6">
            <img 
              src={product.image}   
              alt={product.name} 
              className="w-full aspect-square object-cover"
            />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
          <p className="text-[#C5A059] text-2xl font-black mb-6">{product.price}</p>
          
          <div className="space-y-4">
            <h3 className="text-slate-400 font-medium uppercase text-xs tracking-widest">Тайлбар</h3>
            <p className="text-slate-300 leading-relaxed italic">
              {product.description || "Тайлбар байхгүй байна."}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#161616]">
          <button 
            onClick={() => {
              onBuy(product.name);
              onClose();
            }}
            className="w-full bg-[#C5A059] hover:bg-[#A88548] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShoppingBag size={20} />
            Buy
          </button>
        </div>
      </div>
    </>
  );
}