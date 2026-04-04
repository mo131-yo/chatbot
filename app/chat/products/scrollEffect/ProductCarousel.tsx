"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { ProductDetailSidebar } from "../detail/ProductDetailSidebar";
import { Heart, X } from "lucide-react";
import { useFavoriteStore } from "@/app/store/useFavoriteStore";
import HorizontalProductStack from "../HorizontalProductStack/page";
interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

interface ProductCarouselProps {
  products: any[]; 
  onSelect: (product: any) => void;
  onBuy: (name: string, price: any) => void;
  history: any[];
}

export const ProductCarousel = ({ products, history, onSelect, onBuy }: ProductCarouselProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const { savedIds, toggleFavorite } = useFavoriteStore();
  
  if (!products || products.length === 0) return null;

  const handleBuy = (name: string, price: string) => {
    console.log(`Buy triggered for: ${name} at ${price}`);
  };

  function handleSend(opt: string): void {
    throw new Error("Function not implemented.");
  }

  
  const handleSave = async (productId: string) => {
    const targetProduct = products.find(p => p.id === productId);
    try {
      const res = await fetch("/chat/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId,
          name: targetProduct?.name || "Product",
          price: targetProduct?.price || 0,
          image: targetProduct?.image || ""
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          setSavedProducts(prev => [...prev, productId]);
        } else {
          setSavedProducts(prev => prev.filter(id => id !== productId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="w-full space-y-8">
      <HorizontalProductStack 
        products={products} 
        onSelect={(product: any) => setSelectedProduct(product)}
        onOrder={onBuy}
        onSave={(id: string) => {
          const product = products.find((p: any) => p.id === id);
          if (product) toggleFavorite(product);
        }}
        savedIds={savedProducts}
      />

      {savedProducts.length > 0 && (
        <div className="mt-10 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Heart size={20} className="text-red-500" fill="currentColor" />
            <h3 className="text-lg font-bold text-white">Миний хадгалсан бараанууд</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products
              .filter(p => savedProducts.includes(p.id))
              .map(product => (
                <div key={product.id} className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 relative group">
                  <img src={product.image} className="w-full h-32 object-cover rounded-xl mb-2" />
                  <p className="text-white text-xs font-medium truncate">{product.name}</p>
                  <p className="text-[#C5A059] text-sm font-bold">{product.price}₮</p>
                  
                  <button 
                    onClick={() => handleSave(product.id)}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailSidebar 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={onBuy}
        />
      )}
    </div>
  );
};