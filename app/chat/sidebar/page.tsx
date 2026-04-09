"use client";
import { NewChatBtn, ChatHistory } from "./components";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MenuToggle } from "../header/components";

interface SidebarProps {
  isCollapsed: boolean;
  history: any[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isLoading?: boolean;
  activeChatId?: string | null;
}


export default function Sidebar({
  isCollapsed,
  history: initialHistory,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isLoading,
  activeChatId,
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
  ${
    isCollapsed ? "w-0 overflow-hidden" : "w-72"
  }`}
>

      <div className="p-3">
        <NewChatBtn onClick={onNewChat} />
      </div>

      <ChatHistory
        history={history}
        onSelectChat={onSelectChat}
        onPinChat={handlePin}
        onRenameChat={handleRename}
        onShareChat={handleShare}
        onDeleteChat={onDeleteChat}
        isLoading={isLoading}
        activeChatId={activeChatId}
      />
    </aside>
  );
}
