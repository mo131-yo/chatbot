"use client"

import { FaShoppingCart } from "react-icons/fa";
import AddToCartButton from "../cart-inside/components/AddtoCartButton";
import { LogoTemp, MenuToggle, NavActions } from "./components";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
 const { cartCount } = useCart();
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-black/6 dark:border-white/6 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <MenuToggle onClick={toggleSidebar} />
        <LogoTemp />
      </div>
      {/* <div className="relative cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors">
        <FaShoppingCart className="text-xl text-[#C5A059]" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg border border-black">
            {cartCount}
          </span>
        )}
      </div> */}
      <Link href="/cart" className="relative p-3 hover:bg-white/10 rounded-full transition-all group">
        <FaShoppingCart className="text-xl text-[#C5A059] group-hover:scale-110 transition-transform" />
        
        {/* Хэрэв сагс хоосон биш бол тоог харуулна */}
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#0D0D0D] animate-in zoom-in">
            {cartCount}
          </span>
        )}
      </Link>
      <NavActions />
    </header>
  );
};