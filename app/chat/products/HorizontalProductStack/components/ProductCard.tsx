"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ImageIcon, Store, Tag, Box } from "lucide-react";
import { useState, useEffect } from "react";

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

  // Өгөгдлийн бүтцийг нэгтгэж унших - Markdown-аас ирсэн
  const productId = product.id ?? product.product_id ?? product.name;
  const name = product.metadata?.name || product.product_name || product.name || "Нэргүй бараа";
  
  // ✅ Brand - Markdown болон Pinecone metadata-аас уншина
  const brand = product.brand || product.metadata?.brand || "";
  
  // ✅ StoreName - Markdown-аас эхэлнэ, дараа metadata-с, сүүлд "Official Store"
  // namespace-г унааж болохгүй (энэ нь ID)
  const storeName = 
    (product.storeName && product.storeName.trim()) ?
      product.storeName.trim() :
    (product.store_name && product.store_name.trim()) ?
      product.store_name.trim() :
    (product.metadata?.store_name && product.metadata.store_name.trim()) ?
      product.metadata.store_name.trim() :
    "Turuu's shop";
  
  const stock = product.metadata?.stock ?? product.stock;
  
  useEffect(() => {
    const pineconeImage =
      product.metadata?.product_image_url || 
      product.product_image_url ||           
      product.metadata?.image_url ||         
      product.image;

    if (pineconeImage && String(pineconeImage).startsWith("http")) {
      setImageUrl(pineconeImage);
    } else {
      setImageUrl(null);
    }
    setImgError(false);
  }, [product]);

  const productWithImage = { 
    ...product, 
    image: imageUrl || product.image, 
    name, 
    storeName,
    brand,
  };

  return (
    <div
      className={`relative mx-auto flex flex-col h-125 w-72 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent ? "border-[#C5A059] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "border-white/5"
      }`}
    >
      <div className="relative h-60 w-full overflow-hidden shrink-0">
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
          <div className="h-full w-full flex flex-col items-center justify-center bg-white/5">
            <ImageIcon className="text-white/20 mb-2" size={40} />
            <span className="text-white/10 text-[10px]">Зураггүй</span>
          </div>
        )}

        {/* ✅ Brand badge - Markdown болон Pinecone-аас байвал харуулна */}
        {brand && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1">
            <Tag size={12} className="text-[#C5A059]" />
            <span className="text-white text-[10px] font-medium">{brand}</span>
          </div>
        )}

        {/* Heart/Save button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(product);
            }}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
          >
            <Heart size={18} className={savedIds?.includes(productId) ? "text-red-500 fill-red-500" : "text-white"} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 justify-between bg-[#121212]">
        <div className="space-y-2">
          {/* ✅ StoreName display - БҮРЭН байх үнэ */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-white/50">
              <Store size={14} className="text-[#C5A059]" />
              <span className="text-[11px] font-bold uppercase tracking-wider line-clamp-1">
                {storeName}
              </span>
            </div>
            {stock !== undefined && (
              <div className="flex items-center gap-1 text-white/40">
                <Box size={12} />
                <span className="text-[10px]">Нөөц: {stock}</span>
              </div>
            )}
          </div>

          {/* Product name */}
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">{name}</h3>

          {/* Price */}
          <p className="text-[#C5A059] text-2xl font-black">
            {(() => {
              const rawPrice = product.metadata?.price ?? product.price ?? 0;
              const numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
              return isNaN(numericPrice) ? "Үнэгүй" : numericPrice.toLocaleString() + "₮";
            })()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="h-13 mt-4">
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
                    onOrder?.(productWithImage);
                  }}
                  className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-black font-bold active:scale-95 transition-all text-sm"
                  disabled={stock === 0}
                >
                  {stock === 0 ? "Дууссан" : "Захиалах"}
                </button>

                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(productWithImage);
                  }}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
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