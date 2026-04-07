"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import {
  ShoppingBag,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { sendOrderEmail } from "@/lib/service/email";
import { useRouter } from "next/navigation";
import LocationForm from "../../payment/components/form";
import QPayPayment from "../../payment/components/QPayPayment ";

interface Product {
  id: string;
  name: string;
  price: any;
  image: string;
  description: string;
  storeId?: string;
}

interface HorizontalProductStackProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onBuy: (name: string, price: string) => void;
  onSave: (productId: string) => void;
  savedIds?: string[];
}

export function HorizontalProductStack({
  products,
  onSelect,
  onBuy,
  onSave,
  savedIds = [],
}: HorizontalProductStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();
  const lastNavigationTime = useRef(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useUser();

  const { cartItems, clearCart, totalPrice } = useCart(); 

  const parsePrice = (price: any): number => {
    if (!price) return 0;
    const numericString = String(price).replace(/[^0-9.]/g, "");
    const result = parseFloat(numericString);
    return isNaN(result) ? 0 : result;
  };

  
  const navigate = useCallback(
    (newDirection: number) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < 250) return;
      lastNavigationTime.current = now;

      setCurrentIndex((prev) => {
        if (newDirection > 0)
          return prev === products.length - 1 ? 0 : prev + 1;
        return prev === 0 ? products.length - 1 : prev - 1;
      });
    },
    [products.length],
  );

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setShowLocationForm(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 40;
    if (info.offset.x < -threshold) navigate(1);
    else if (info.offset.x > threshold) navigate(-1);
  };

  const getCardStyle = (index: number) => {
    const total = products.length;
    let diff = index - currentIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff === 0) return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0 };
    if (Math.abs(diff) === 1)
      return {
        x: diff * (typeof window !== "undefined" && window.innerWidth < 768 ? 140 : 200),
        scale: 0.8,
        opacity: 0.3,
        zIndex: 5,
        rotateY: diff * -15,
      };

    return { x: diff > 0 ? 500 : -500, scale: 0.5, opacity: 0, zIndex: 0 };
  };


  const handlePaymentSuccess = async (details: any) => {
    console.log("🛒 Сагсан дахь бараанууд:", cartItems);
    if (!user || !cartItems.length) return;

    try {
      const orderId = details.transactionId || `INV-${Date.now()}`;
      
      const numericTotal = typeof totalPrice === 'string' ? parseFloat(totalPrice) : totalPrice;

      const dbResponse = await fetch("/admin/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
// handlePaymentSuccess функц доторх body хэсэг:
body: JSON.stringify({
  orderId,
  total: totalPrice,
  customerName: user.fullName,
  items: cartItems.map(item => ({
    productId: item.id,      // 'id' биш 'productId' гэж явуулбал илүү тодорхой
    name: item.name,         
    image: item.image,       // Энэ нь бааз руу 'productImage' болж орно
    quantity: item.quantity,
    price: item.price
  })),
}),
    }); 

      const responseText = await dbResponse.text();
      let dbResult;
      try {
        dbResult = JSON.parse(responseText);
      } catch (e) {
        console.error("Серверээс алдаа ирлээ:", responseText);
        return;
      }

      if (dbResponse.ok && dbResult.success) {
        clearCart();
        setTimeout(() => setShowPayment(false), 2000);
      } else {
        console.error("Захиалга хадгалахад алдаа:", dbResult?.error);
      }
    } catch (error) {
      console.error("Системийн алдаа:", error);
    }
  };



  return (
    <div className="relative flex h-137.5 w-full items-center justify-center">
      <AnimatePresence>
        {showLocationForm && (
          <LocationForm 
            onClose={() => setShowLocationForm(false)} 
            onConfirm={() => {
              setShowLocationForm(false);
              setShowPayment(true);
            }}
          />
        )}
        {showPayment && selectedProduct && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <QPayPayment 
              amount={parsePrice(selectedProduct.price)}
              orderId={`INV-${Math.floor(Math.random() * 100000)}`}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPayment(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="absolute left-6 z-50">
        <button onClick={() => navigate(-1)} className="p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:text-[#C5A059] transition-all">
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: "1200px" }}>
        {products.map((product, index) => {
          const style = getCardStyle(index);
          const isCurrent = index === currentIndex;
          if (style.opacity === 0 && !isCurrent) return null;

          const displayPrice = parsePrice(product.price).toLocaleString();

          return (
            <motion.div
              key={`${product.id}-${index}`}
              className="absolute"
              animate={style}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <div className={`relative h-105 w-70 md:h-120 md:w-[320px] rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${isCurrent ? "border-[#C5A059] shadow-[0_0_50px_rgba(197,160,89,0.2)]" : "border-white/5"}`}>
                <div className="h-full w-full relative group overflow-hidden rounded-[2.5rem]">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover select-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white text-lg font-bold">{product.name}</p>
                    <p className="text-[#C5A059] text-xl font-black">{displayPrice}₮</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isCurrent && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-0 w-full p-6 space-y-3 bg-gradient-to-t from-black to-transparent">
                      <div className="flex gap-2.5">
                        <button onClick={() => handleOrderClick(product)} className="flex-1 h-12 bg-[#C5A059] rounded-2xl text-white font-bold active:scale-95 transition-transform">Захиалах</button>
                        <button onClick={() => addToCart(product)} className="bg-[#C5A059] text-black h-12 w-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"><ShoppingBag size={18} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="absolute right-6 z-50">
        <button onClick={() => navigate(1)} className="p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:text-[#C5A059] transition-all">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}