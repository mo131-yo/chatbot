"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatHistory } from "./chat-history";

type ChatItem = {
  id: string;
  title: string;
};

export default function Sidebar() {
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/chat/history", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch history");
      }

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History fetch error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSelectChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/session/${id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load session");
      }

      console.log("selected chat session:", data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-slate-500">Loading...</div>;
  }

  return <ChatHistory history={history} onSelectChat={handleSelectChat} />;
}
