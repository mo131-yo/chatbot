"use client";
import { useCart } from "@/app/context/CartContext";
import { useUser } from "@clerk/nextjs";
import emailjs from '@emailjs/browser';
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

const handleFakePayment = async () => {
  if (!user) return alert("Нэвтэрнэ үү");

  try {
    const orderRes = await fetch('/chat/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalPrice,
      })
    });

    const newOrder = await orderRes.json();
    console.log("Шинэ захиалга үүслээ:", newOrder);

    const webRes = await fetch('/chat/api/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: newOrder.id, 
        status: 'success',
        secret_token: 'demo_secret_123'
      })
    });

    const templateParams = {
      email: user.primaryEmailAddress?.emailAddress, 
      order_id: newOrder.id,
      user_name: user.firstName || "Хэрэглэгч",
      order_details: cartItems.map(item => `${item.name} (x${item.quantity})`).join("\n"),
      total_price: `${(totalPrice + 5000).toLocaleString()}₮`
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    alert("Төлбөр амжилттай! Имэйл илгээгдлээ.");
    clearCart(); 
    router.push("/success");

  } catch (err: any) {
    console.error("Payment error:", err);
    alert(`Алдаа гарлаа: ${err.message}`);
  }
};
    
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Захиалга баталгаажуулах</h1>
      

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <p className="text-xl mb-4">Нийт төлөх дүн: <span className="text-[#C5A059]">{totalPrice.toLocaleString()}₮</span></p>
        
        <button 
          onClick={handleFakePayment}
          className="w-full py-4 bg-[#C5A059] text-black font-bold rounded-xl hover:bg-white transition-all"
        >
          Төлбөр төлөх
        </button>   
      </div>
    </div>
  );    
}