"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const [openSettings, setOpenSettings] = useState(false);
  const path = usePathname();
  const { user } = useUser();

  // ✅ ADMIN CHECK
  const isAdmin = user?.publicMetadata?.role === "admin";

  // ✅ ROLE-BASED MENU
  const menu = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      role: "admin",
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      role: "admin",
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      role: "admin",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      role: "admin",
    },
  ];

  return (
    <aside
      className="w-64 h-screen p-5 flex flex-col justify-between
      bg-[#1c2541] text-white
      dark:bg-gray-300 dark:text-black transition-colors duration-300"
    >
      {/* TOP */}
      <div>
        <h1 className="text-xl font-bold mb-6">Luxe AI</h1>

        {/* MENU */}
        <nav className="space-y-2">
          {menu
            .filter((item) =>
              item.role === "admin" ? isAdmin : true
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl
                  transition-all duration-200 ${
                    path === item.href
                      ? "bg-indigo-600 text-white scale-105 shadow-lg"
                      : "hover:bg-indigo-800 hover:translate-x-1 dark:hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}

          {/* ❌ ADMIN биш үед */}
          {!isAdmin && (
            <p className="text-sm text-gray-400 mt-4">
              🚫 Admin access required
            </p>
          )}
        </nav>
      </div>

   
      <div className="relative">
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="w-full bg-white/5 p-3 rounded-xl text-left hover:bg-white/10 transition"
        >
          ⚙️ Settings
        </button>

        {openSettings && (
          <div
            className="
            absolute bottom-14 left-0 w-full
            p-4 rounded-2xl
            bg-white/10 backdrop-blur-xl
            text-white
            dark:bg-white/70 dark:text-black
            border border-white/20 dark:border-gray-300
            shadow-2xl space-y-4
            animate-dropdown
          "
          >
            {/* THEME */}
            <div>
              <p className="text-xs text-gray-300 dark:text-gray-600 mb-1">
                Theme
              </p>
              <ThemeToggle />
            </div>

            {/* USER INFO */}
            {user && (
              <div className="text-xs text-gray-400 dark:text-gray-600">
                👤 {user.primaryEmailAddress?.emailAddress}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}