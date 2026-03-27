// "use client";

// import { useState } from "react";
// import { FaShoppingCart } from "react-icons/fa";

// export default function AddToCartButton({ productId }: { productId: string }) {
//   const [loading, setLoading] = useState(false);

//   const addToCart = async () => {
//     setLoading(true);

//     await fetch("/api/cart/add-item", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         productId,
//         quantity: 1,
//       }),
//     });

//     setLoading(false);
//   };

//   return (
//     <button
//       onClick={addToCart}
//       className="bg-black text-white rounded-full px-4 py-2"
//     >
//       {loading ? "Adding..." : <FaShoppingCart />}
//     </button>
//   );
// }




"use client";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const { refreshCart } = useCart();

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={addToCart}
      disabled={loading}
      className="bg-[#C5A059] hover:bg-white text-black rounded-full p-2.5 transition-all active:scale-90 disabled:opacity-50"
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
      ) : (
        <FaShoppingCart />
      )}
    </button>
  );
}