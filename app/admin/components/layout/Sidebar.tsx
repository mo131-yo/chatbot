"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-[#1c2541] h-screen p-5 flex flex-col">
      <h1 className="text-xl font-bold mb-6">Luxe AI</h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                path === item.href
                  ? "bg-button scale-105 shadow-lg"
                  : "hover:bg-indigo-800 hover:translate-x-1"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
