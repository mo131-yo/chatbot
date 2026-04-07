"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import ThemeToggle from "../ui/ThemeToggle";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const [openSettings, setOpenSettings] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const path = usePathname();
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string;

  return (
    <aside
      className={`h-screen p-5 flex flex-col justify-between transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}
      bg-[#1c2541] text-white`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide">Luxe AI</h1>
          )}

          <div className="flex items-center gap-2">
            <UserButton />

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs bg-white/10 px-2 py-1 rounded"
            >
              {collapsed ? "👉" : "👈"}
            </button>
          </div>
        </div>

        {!collapsed && role === "admin" && (
          <span
            className="text-[10px] px-2 py-1 rounded-full text-white mb-4 inline-block
  bg-linear-to-r from-red-500 via-pink-500 to-orange-500
  animate-pulse shadow-lg shadow-red-500/40"
          >
            ADMIN 🔥
          </span>
        )}

        <nav className="space-y-2 mt-4">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${
                  path === item.href
                    ? "bg-indigo-600 text-white shadow"
                    : "hover:bg-indigo-800"
                }`}
              >
                <Icon size={18} />

                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="relative">
        {openSettings && !collapsed && (
          <div className="mt-3 p-3 rounded-xl bg-white/10 backdrop-blur text-white space-y-2">
            <div>
              {" "}
              <span className="text-sm">THEME</span>
              <ThemeToggle />
              <p className="text-xs opacity-70"></p>
            </div>
          </div>
        )}
        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="w-full bg-white/5 p-3 rounded-xl text-left hover:bg-white/10 transition mt-5"
        >
          {!collapsed ? "⚙️ Settings" : "⚙️"}
        </button>
      </div>
    </aside>
  );
}
