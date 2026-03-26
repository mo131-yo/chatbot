"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();

  const linkClass = (href: string) =>
    `block p-2 rounded ${path === href ? "bg-button" : "hover:bg-indigo-800"}`;

  return (
    <aside className="w-64 bg-primary h-screen p-5">
      <h1 className="text-xl font-bold mb-6">Admin</h1>

      <nav className="space-y-2">
        <Link href="/admin" className={linkClass("/admin")}>
          Dashboard
        </Link>
        <Link href="/admin/products" className={linkClass("/admin/products")}>
          Products
        </Link>
      </nav>
    </aside>
  );
}
