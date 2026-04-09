"use client";

import { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { LogoTemp, MenuToggle } from "./components";
import { useCart } from "@/app/context/CartContext";

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { cartCount, setIsCartOpen } = useCart();
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    fetch("/chat/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavoriteCount(data.length));

    const handleInstantUpdate = (e: any) => {
      setFavoriteCount(e.detail.count);
    };

    window.addEventListener("updateFavoriteCount", handleInstantUpdate);
    return () =>
      window.removeEventListener("updateFavoriteCount", handleInstantUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-9999 flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#0D0D0D] backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* <MenuToggle onClick={toggleSidebar} /> */}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("openFavorites"))}
          className="relative p-3 hover:bg-white/10 rounded-full transition-all"
        >
          <FaHeart
            className={`text-xl transition-colors duration-100 ${favoriteCount > 0 ? "text-red-500" : "text-[#C5A059]"}`}
          />

          {favoriteCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-[#0D0D0D]">
              {favoriteCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-3 hover:bg-white/10 rounded-full transition-all"
        >
          <FaShoppingCart className="text-xl text-[#C5A059]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] text-[10px] font-black text-black ring-2 ring-[#0D0D0D]">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      {/* <NavActions /> */}
    </header>
  );
}
