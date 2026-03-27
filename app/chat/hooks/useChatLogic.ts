"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export const useChatLogic = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, any[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const { user, isSignedIn } = useUser();

  const fetchUserHistory = useCallback(async () => {
    if (isSignedIn && user) {
      setIsLoading(true);
      try {
        const res = await fetch("/chat/api/history");
        if (res.ok) {
          const sessions = await res.json();
          const history = sessions.map((s: any) => ({ id: s.id, title: s.title || "Шинэ чат" }));
          const chatsMap: Record<string, any[]> = {};
          sessions.forEach((s: any) => {
            chatsMap[s.id] = s.messages.map((m: any) => ({ role: m.role, content: m.content }));
          });

          setSidebarHistory(history);
          setAllChats(chatsMap);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const savedAllChats = localStorage.getItem("ai_all_chats");
      const savedSidebar = localStorage.getItem("ai_sidebar_history");
      if (savedAllChats) setAllChats(JSON.parse(savedAllChats));
      if (savedSidebar) setSidebarHistory(JSON.parse(savedSidebar));
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  useEffect(() => {
    const migrateHistory = async () => {
      const guestId = localStorage.getItem("guest_id");
      if (isSignedIn && user?.id && guestId) {
        try {
          const res = await fetch("/chat/api/auth/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestId, realUserId: user.id }),
          });

          if (res.ok) {
            localStorage.removeItem("guest_id");
            localStorage.removeItem("ai_all_chats");
            localStorage.removeItem("ai_sidebar_history");
            fetchUserHistory(); 
          }
        } catch (err) {
          console.error("Migration error:", err);
        }
      }
    };
    migrateHistory();
  }, [isSignedIn, user?.id, fetchUserHistory]);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("guest_id")) {
      localStorage.setItem("guest_id", `guest_${crypto.randomUUID()}`);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      localStorage.setItem("ai_all_chats", JSON.stringify(allChats));
      localStorage.setItem("ai_sidebar_history", JSON.stringify(sidebarHistory));
    }
  }, [allChats, sidebarHistory, isSignedIn]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    setIsTyping(true);

    const userId = user?.id || localStorage.getItem("guest_id");
    const chatId = activeChatId || Date.now().toString();
    const userMessage = { role: "user", content: message };
    
    const updatedMessages = [...(allChats[chatId] || []), userMessage];
    setAllChats(prev => ({ ...prev, [chatId]: updatedMessages }));

    if (!activeChatId) {
      setActiveChatId(chatId);
      setSidebarHistory(prev => [{ id: chatId, title: message.slice(0, 20) }, ...prev]);
    }

    try {
      const res = await fetch("/chat/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, chatId, userId }),
      });

      if (!res.ok) throw new Error("API холболт амжилтгүй");
      const data = await res.json();

      setAllChats(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), { role: "assistant", content: data.reply }]
      }));
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return {
  activeChatId, 
  setActiveChatId,
  allChats, 
  sidebarHistory,
  isTyping, 
  setIsTyping,
  isLoading,
  sendMessage
};
};