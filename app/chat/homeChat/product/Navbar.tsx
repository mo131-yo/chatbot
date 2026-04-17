"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 left-0 w-full px-8 py-5 flex justify-between items-center z-100 pointer-events-none">
      <div className="pointer-events-auto">
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        {isAdmin && (
          <Link 
            href="/admin" 
            className="flex items-center gap-2 bg-gray-100 dark:bg-white/5   hover:bg-white/6 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <ShieldCheck size={13} className="text-indigo-400" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Admin</span>
          </Link>
        )}
        <div className="ml-2 flex items-center border-l border-white/10 pl-4 h-8">
        </div>
      </div>
    </nav>
  );
}