"use client";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaMinus, FaPlus, FaTrash, FaTimes } from "react-icons/fa";

export default function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
   const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };
  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
          />

          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0D0D0D] border-l border-white/10 shadow-2xl z-101 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Таны сагс ({cartItems.length})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <FaTimes className="text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <p>Сагс хоосон байна</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <img src={item.image} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium text-sm line-clamp-1">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                          <FaTrash size={12} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#C5A059] font-bold">{(item.price * item.quantity).toLocaleString()}₮</span>
                        
                        <div className="flex items-center gap-3 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-white hover:text-[#C5A059] p-1">
                            <FaMinus size={10} />
                          </button>
                          <span className="text-white text-sm font-bold min-w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-white hover:text-[#C5A059] p-1">
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-400">Нийт дүн:</span>
                  <span className="text-[#C5A059]">{totalPrice.toLocaleString()}₮</span>
                </div>
                <button className="w-full py-4 bg-[#C5A059] text-black font-black rounded-xl uppercase hover:bg-white transition-all shadow-lg shadow-[#C5A059]/20">
                  Захиалга өгөх
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}