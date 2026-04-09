"use client";
import { NewChatBtn, ChatHistory } from "./components";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ClerkAuth, DarkMode, MenuToggle } from "../header/components";
import { Plus, PanelLeft, SquarePen, MessageSquarePlus } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  history: any[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isLoading?: boolean;
  activeChatId?: string | null;
  toggleSidebar: () => void;
  collapsed: boolean;
}

export default function Sidebar({
  isCollapsed,
  history: initialHistory,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isLoading,
  activeChatId,
  toggleSidebar,
  collapsed,
}: SidebarProps) {
  const router = useRouter();
  const [history, setHistory] = useState(initialHistory);

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  const handlePin = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" }),
      });
      if (res.ok) {
        setHistory((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c)),
        );
      }
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title }),
      });
      if (res.ok) {
        setHistory((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c)),
        );
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
      if (res.ok) {
        const url = `${window.location.origin}/share/chat/${id}`;
        await navigator.clipboard.writeText(url);
        alert("Хуваалцах линк хуулагдлаа!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  return (
    <aside
      className={`flex flex-col h-screen relative z-20 transition-all duration-300
  bg-white/70 dark:bg-[#0D0D0D]/70 backdrop-blur-xl
  ${isCollapsed ? "w-16" : "w-72"}`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between px-2 py-2">
          {/* ➕ NEW CHAT */}
          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewChat();
              }}
              className="
            flex items-center gap-2 px-3 py-2 rounded-xl
            hover:bg-black/5 dark:hover:bg-white/10
            transition-all duration-200
            text-sm text-slate-600 dark:text-slate-300
          "
            >
              <SquarePen size={18} />
              New chat
            </button>
          )}

          {/* ☰ TOGGLE */}
          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className="
            p-2 rounded-xl
            hover:bg-black/5 dark:hover:bg-white/10
            transition-all duration-200
            active:scale-95
          "
            >
              <PanelLeft size={18} />
            </button>

            {/* 🔥 TOOLTIP */}
            {collapsed && (
              <div
            className="
  pointer-events-none
  absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2

  px-3 py-2 rounded-lg
  bg-black text-white
  dark:bg-white dark:text-black

  text-xs
  opacity-0 invisible
  translate-x-[-6px]

  group-hover:opacity-100
  group-hover:visible
  group-hover:translate-x-0

  transition-all duration-200
  z-[9999]
  whitespace-nowrap
  shadow-xl
"
              >
                Open menu
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatHistory
        collapsed={isCollapsed}
        history={history}
        onSelectChat={onSelectChat}
        onPinChat={handlePin}
        onRenameChat={handleRename}
        onShareChat={handleShare}
        onDeleteChat={onDeleteChat}
        isLoading={isLoading}
        activeChatId={activeChatId}
      />

      <div className="mt-auto w-full px-2 pb-3">
        <div className="h-px bg-black/5 dark:bg-white/5 my-2" />
        <DarkMode collapsed={isCollapsed} />
        <ClerkAuth collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
