"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";
import { useRouter } from "next/dist/client/components/navigation";

export default function Sidebar() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // const fetchHistory = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch("/api/chat/history", { cache: "no-store" });
  //     const data = await res.json();
  //     setHistory(Array.isArray(data) ? data : []);
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     setHistory([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchHistory = useCallback(async () => {
  try {
    const res = await fetch("/api/chat/history", { 
      cache: "no-store",
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Fetch error:", error);
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
  if (response.ok){
    await fetchHistory();
    router.refresh();
  }
  } catch (error) {  console.error("Rename error:", error);
};
};

const handleShare = async (id: string) => {
  try {
    const response = await fetch(`/chat/api/chat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    });
    if (response.ok){
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
      chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat
    );
    return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
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
        body: JSON.stringify({ action: "delete" })
      });
      if (res.ok) {
        await fetchHistory();
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="p-4 text-sm text-slate-500">Уншиж байна...</div>;

  return (
    <ChatHistory 
      history={history} 
      onSelectChat={(id) => console.log("Selected:", id)}
      onPinChat={handlePin}
      onRenameChat={handleRename}
      onDeleteChat={handleDeleteChat}
      onShareChat={handleShare}
    />
  );
}