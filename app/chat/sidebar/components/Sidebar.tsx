"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";
import { useRouter } from "next/dist/client/components/navigation";
import { NewChatBtn } from "./new-chat-btn";
import { Menu } from "lucide-react";


export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const [collapsed, setCollapsed] = useState(false);
  // console.log("collapsed", collapsed);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/chat/api/history", {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRename = async (id: string, title: string) => {
    try {
      const response = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title }),
      });
      if (response.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Rename error:", error);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const response = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
      if (response.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handlePin = async (id: string) => {
    setHistory((prevHistory) => {
      const updated = prevHistory.map((chat) =>
        chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat,
      );
      return [...updated].sort(
        (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
      );
    });

    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" }),
      });

      if (!res.ok) {
        fetchHistory();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Pin error:", err);
      fetchHistory();
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      if (res.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading)
    return <div className="p-4 text-sm text-slate-500">Уншиж байна...</div>;

  return (
    <aside
      className={`flex flex-col h-screen relative z-20
  transition-all duration-300
  bg-white/70 dark:bg-[#0D0D0D]/70 backdrop-blur-xl
  ${collapsed ? "w-16" : "w-72"}
  overflow-visible
`}
    >
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition text-white"
        >
          <Menu size={20} className="text-white" />
        </button>
      </div>
      <NewChatBtn onClick={() => console.log("new")} collapsed={collapsed} />

      <ChatHistory
        collapsed={collapsed}
        history={history}
        onSelectChat={(id) => router.push(`/chat/${id}`)}
        onPinChat={handlePin}
        onRenameChat={handleRename}
        onDeleteChat={handleDeleteChat}
        onShareChat={handleShare}
      />
      <div>
 
      </div>
    </aside>
  );
}
