"use client";

import { Moon, Sun, Monitor, Palette, Crown, Sparkles, Flower2, Trees, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DarkMode = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center rounded-full w-10 h-10 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none relative shrink-0">
        <Palette className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <span className="sr-only">Choose theme</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 p-2">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
          <Sun className="h-4 w-4" /> <span>Light</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
          <Moon className="h-4 w-4" /> <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("minimalist")} className="gap-2 cursor-pointer">
          <Sparkles className="h-4 w-4 text-blue-500" /> <span>Minimalist</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("midnight")} className="gap-2 cursor-pointer">
          <Monitor className="h-4 w-4 text-indigo-500" /> <span>Midnight</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("luxury")} className="gap-2 cursor-pointer font-medium text-[#C5A059]">
          <Crown className="h-4 w-4" /> <span>Luxury Gold</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("forest")} className="gap-2 cursor-pointer">
          <Trees className="h-4 w-4 text-emerald-500" /> <span>Forest Deep</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("cyber")} className="gap-2 cursor-pointer">
          <Zap className="h-4 w-4 text-purple-500" /> <span>Cyber Violet</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("rose")} className="gap-2 cursor-pointer">
          <Flower2 className="h-4 w-4 text-rose-400" /> <span>Rose Quartz</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};