"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";

export default function Sidebar() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat/history", { cache: "no-store" });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePinChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/session/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" }),
      });
      if (res.ok) fetchHistory();
    } catch (error) {
      console.error("Pin error:", error);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chat/session/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title: newTitle }),
      });
      if (res.ok) fetchHistory();
    } catch (error) {
      console.error("Rename error:", error);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/session/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchHistory();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="p-4 text-sm text-slate-500">Уншиж байна...</div>;

  return (
    <ChatHistory 
      history={history} 
      onSelectChat={(id) => console.log("Selected:", id)}
      onPinChat={handlePinChat}
      onRenameChat={handleRenameChat}
      onDeleteChat={handleDeleteChat}
      onShareChat={(id) => console.log("Shared:", id)}
    />
  );
}