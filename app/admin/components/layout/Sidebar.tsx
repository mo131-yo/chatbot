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
      bg-[#1c2541]/90 backdrop-blur-xl border-r border-white/10 text-white`}
    >
      {/* TOP */}
      <div>
        {/* LOGO + AVATAR */}
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Luxe AI
            </h1>
          )}

          <div className="flex items-center gap-2">
            <UserButton />

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition"
            >
              {collapsed ? "👉" : "👈"}
            </button>
          </div>
        </div>

        {/* ADMIN BADGE */}
        {!collapsed && role === "admin" && (
          <span
  className="text-[10px] px-2 py-1 rounded-full text-white mb-4 inline-block
  bg-gradient-to-r from-red-500 via-pink-500 to-orange-500
  animate-pulse shadow-lg shadow-red-500/40"
>
  ADMIN 🔥
</span>
        )}

        {/* MENU */}
        <nav className="space-y-2 mt-4">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group">
                {/* ACTIVE LINE */}
                {path === item.href && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-indigo-400 rounded-r" />
                )}

                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 pl-4 rounded-xl transition-all duration-300
                  ${
                    path === item.href
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.02]"
                      : "hover:bg-white/10 hover:translate-x-1 hover:shadow-md"
                  }`}
                >
                  <Icon
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-125"
                  />

                  {!collapsed && (
                    <span className="transition-all duration-200">
                      {item.name}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* SETTINGS */}
      <div className="relative">
        {openSettings && !collapsed && (
          <div className="mb-3 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-3 animate-fade">
            <div className="flex justify-between items-center">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}

        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="w-full bg-white/5 p-3 rounded-xl text-left hover:bg-white/10 transition"
        >
          {!collapsed ? "⚙️ Settings" : "⚙️"}
        </button>
      </div>
    </aside>
  );
}