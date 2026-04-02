"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatHistory } from "./chat-history";
import { NewChatBtn } from "./new-chat-btn";

interface SidebarProps {
  isCollapsed: boolean;
  history: any[]; 
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isLoading?: boolean;
  activeChatId?: string | null;   
}

export default function Sidebar({ 
  isCollapsed, 
  history: initialHistory, 
  onNewChat, 
  onSelectChat, 
  isLoading, 
  activeChatId
}: SidebarProps) {
  const router = useRouter();
  const [localHistory, setLocalHistory] = useState(initialHistory);

  useEffect(() => {
    setLocalHistory(initialHistory);
  }, [initialHistory]);

 const handleUpdate = async (id: string, body: { action: string; title?: string }) => {
  try {
    const res = await fetch(`/api/session/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updatedChat = await res.json();
      
      setLocalHistory(prev => 
        prev.map(chat => chat.id === id ? updatedChat : chat)
      );

      router.refresh();
    }
  } catch (error) {
    console.error("Update failed:", error);
  }
};

  const handlePin = (id: string) => handleUpdate(id, { action: "pin" });
  
  const handleRename = (id: string, title: string) => {
    if (title.trim()) handleUpdate(id, { action: "rename", title });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ яриаг устгах уу?")) return;
    try {
      const res = await fetch(`/api/chat/session/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocalHistory(prev => prev.filter(chat => chat.id !== id));
        router.refresh();
        if (activeChatId === id) router.push("/");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <aside className={`flex flex-col h-screen relative z-20 transition-all duration-300 ease-in-out bg-white dark:bg-[#0D0D0D] border-r border-black/10 dark:border-white/5 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
      }`}>
      <div className="p-3">
        <NewChatBtn onClick={onNewChat} />
      </div>

      <ChatHistory 
        history={localHistory}
        onSelectChat={onSelectChat}
        onPinChat={handlePin}
        onRenameChat={handleRename}
        onShareChat={(id) => console.log("Shared:", id)}
        onDeleteChat={handleDelete}
        isLoading={isLoading} 
        activeChatId={activeChatId}
      />
    </aside>
  );
}