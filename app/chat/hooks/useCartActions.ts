import { useState } from 'react';

export const useCartActions = () => {
  const [loading, setLoading] = useState(false);

  const addToCart = async (productId: string, quantity: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/controller/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Алдаа гарлаа");
      }

      const result = await response.json();
      alert("Сагсанд амжилттай нэмэгдлээ!");
      return result;
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
};