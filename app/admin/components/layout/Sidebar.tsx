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

const menu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [openSettings, setOpenSettings] = useState(false);
  const path = usePathname();

  return (
    <aside
      className="w-64 h-screen p-5 flex flex-col justify-between
      bg-[#1c2541] text-white
      dark:bg-gray-300 dark:text-black transition-colors duration-300"
    >
      <div>
        <h1 className="text-xl font-bold mb-6">Luxe AI</h1>

        <nav className="space-y-2">
          {menu.map((item) => {
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
        </nav>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="w-full p-3 rounded-xl text-left
          bg-white/5 hover:bg-white/10
          dark:bg-gray-200 dark:hover:bg-gray-300
          transition-all duration-200"
        >
          ⚙️ Settings
        </button>

        {openSettings && (
          <div
            className="p-3 rounded-xl space-y-3 border
            bg-gray-800 border-white/10
            dark:bg-white dark:border-gray-300
            transition-all duration-300"
          >
            <div>
              <p className="text-sm mb-1 text-gray-400 dark:text-gray-600">
                Theme
              </p>
              <ThemeToggle />
            </div>

           
          </div>
        )}

        <button className="w-full bg-primary/50 p-2 rounded transition hover:opacity-80">
          Logout
        </button>
      </div>
    </aside>
  );
}
