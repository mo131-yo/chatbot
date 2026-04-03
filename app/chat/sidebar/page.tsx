"use client";
import { NewChatBtn, ChatHistory } from "./components";
import { useRouter } from "next/navigation";

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
  history, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  isLoading, 
  activeChatId
}: SidebarProps) {
  const router = useRouter();

 const handlePin = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" })
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title })
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" })
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/chat/api/chat/${id}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        router.refresh();
        if (activeChatId === id) {
          router.push("/");
        }
      } else {
        console.error("Устгахад алдаа гарлаа");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <aside 
      className={`flex flex-col h-screen relative z-20 transition-all duration-300 ease-in-out bg-white dark:bg-[#0D0D0D] border-r border-black/10 dark:border-white/5 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
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
        onDeleteChat={handleDelete}
        isLoading={isLoading} 
        activeChatId={activeChatId}
      />
    </aside>
  );
}