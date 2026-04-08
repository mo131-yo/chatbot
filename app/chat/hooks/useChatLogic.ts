"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { title } from "process";
 
type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";
type ChatMessage = { role: ChatRole; content: string; imagePreview?: string };
type SidebarChatItem = { id: string; title: string };
type HistorySession = {
  id: string;
  title: string | null;
  messages: { role: ChatRole; content: string; imagePreview?: string | null }[];
};
 
export const useChatLogic = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  const fetchUserHistory = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      setIsLoading(true);
      const res = await fetch("/chat/api/history", { cache: "no-store" });
      if (!res.ok) {
        setSidebarHistory([]);
        setAllChats({});
        return;
      }
 
      const sessions: HistorySession[] = await res.json();
      const history = sessions.map((s) => ({
        id: s.id,
        title: s.title || s.messages?.[0]?.content?.slice(0, 20) || "Шинэ чат",
      }));
 
      const chatsMap: Record<string, ChatMessage[]> = {};
      sessions.forEach((s) => {
        chatsMap[s.id] = (s.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          imagePreview: m.imagePreview ?? undefined,
        }));
      });
 
      setSidebarHistory(history);
      setAllChats(chatsMap);
    } catch (e) {
      console.error("fetchUserHistory error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);
 
  const syncUser = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      await fetch("/chat/api/sync-user", { method: "POST" });
    } catch (e) {
      console.error("sync-user error:", e);
    }
  }, [isSignedIn]);
 
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      syncUser();
      fetchUserHistory();
    } else {
      setSidebarHistory([]);
      setAllChats({});
      setActiveChatIdState(null);
    }
  }, [isLoaded, isSignedIn, syncUser, fetchUserHistory]);
 
  const createSession = useCallback(
    async (title: string) => {
      if (!isSignedIn) {
        openSignIn();
        throw new Error("Unauthorized");
      }
      const res = await fetch("/chat/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    [isSignedIn, openSignIn],
  );
 
  const loadChat = useCallback(
    async (chatId: string | null) => {
      if (!chatId) {
        setActiveChatIdState(null);
        return;
      }
      if (!isSignedIn) {
        openSignIn();
        return;
      }
      setActiveChatIdState(chatId);
      if (allChats[chatId]) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/chat/api/session/${chatId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load");
        const session = await res.json();
        setAllChats((prev) => ({
          ...prev,
          [chatId]: (session.messages || []).map((m: any) => ({
            role: m.role,
            content: m.content,
            imagePreview: m.imagePreview ?? undefined,
          })),
        }));
      } catch (e) {
        console.error("loadChat error:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [allChats, isSignedIn, openSignIn],
  );
 
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
 
      if (!isSignedIn) {
        openSignIn();
        return;
      }
 
      setIsTyping(true);
 
      try {
        let chatId = activeChatId;
 
        // 🆕 CHAT ҮҮСГЭХ
        if (!chatId) {
          const title = message.slice(0, 40) || "Шинэ чат";
 
          const session = await createSession(title);
          chatId = session.id;
 
          setActiveChatIdState(chatId);
 
          setSidebarHistory((prev) => [{ id: session.id, title }, ...prev]);
 
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        }
 
        // 👤 USER MESSAGE
        const userMessage: ChatMessage = {
          role: "USER",
          content: message,
        };
 
        const nextMessages: ChatMessage[] = [
          ...(allChats[chatId!] || []),
          userMessage,
        ];
 
        setAllChats((prev) => ({
          ...prev,
          [chatId!]: nextMessages,
        }));
 
        // 🤖 AI RESPONSE
        const res = await fetch("/chat/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role.toLowerCase(),
              content: m.content,
            })),
            chatId,
            userId: user?.id,
          }),
        });
 
        if (!res.ok) throw new Error(await res.text());
 
        const data = await res.json();
 
        const aiMessage: ChatMessage = {
          role: "ASSISTANT",
          content: data.reply,
        };
 
        const updatedMessages: ChatMessage[] = [
          ...(allChats[chatId!] || []),
          userMessage,
          aiMessage,
        ];
 
        // 💬 UI UPDATE
        setAllChats((prev) => ({
          ...prev,
          [chatId!]: [...(prev[chatId!] || []), aiMessage],
        }));
 
        // 💾 🔥 DB SAVE (ЧУХАЛ)
        await fetch("/chat/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            title: message.slice(0, 40), // 👉 title sync
            messages: [
              {
                role: "USER",
                content: userMessage.content,
              },
              {
                role: "ASSISTANT",
                content: aiMessage.content,
              },
            ],
          }),
        });
      } catch (e) {
        console.error("sendMessage error:", e);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, allChats, createSession, isSignedIn, openSignIn, user?.id],
  );
 
  const generateTitleFromProducts = (products: any[], fallback?: string) => {
    if (products?.length > 0) {
      const names = products
        .slice(0, 2)
        .map((p) => (p.metadata || p).name)
        .filter(Boolean);
 
      if (names.length === 1) return names[0];
      if (names.length > 1) return `${names[0]} +${products.length - 1}`;
 
      return fallback || "New Chat";
    }
 
    return fallback || "New Chat";
  };
 
  const addVisualResult = useCallback(
    async (userMsg: any, products: any[]) => {
      if (!isSignedIn) {
        openSignIn();
        return;
      }
 
      let chatId = activeChatId;
 
      if (!chatId) {
        const title = generateTitleFromProducts(
          products,
          userMsg.content?.slice(0, 40),
        );
 
        try {
          const session = await createSession(title);
          chatId = session.id;
 
          setActiveChatIdState(chatId);
 
          setSidebarHistory((prev) => [{ id: session.id, title }, ...prev]);
 
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        } catch (e) {
          return;
        }
      }
 
      const newUserMsg: ChatMessage = {
        role: "USER",
        content: userMsg.content || "Зургаар хайж байна...",
        imagePreview: userMsg.imagePreview,
      };
 
      const productLines = (products || [])
        .map((p: any) => {
          const m = p.metadata || p;
          return `![${m.name}, ${m.price}, ${m.description || ""}, ${p.id || m.id}, ${m.store_id}](${m.image_url || m.image})`;
        })
        .join("\n");
 
      const newAiMsg: ChatMessage = {
        role: "ASSISTANT",
        content:
          products.length > 0
            ? `Зургаас ${products.length} тохирох бараа олдлоо!\n\n${productLines}`
            : "Уучлаарай, тохирох бараа олдсонгүй.",
      };
 
      setAllChats((prev) => ({
        ...prev,
        [chatId!]: [...(prev[chatId!] || []), newUserMsg, newAiMsg],
      }));
 
      try {
        await fetch("/chat/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            title: generateTitleFromProducts(
              products,
              userMsg.content?.slice(0, 40),
            ),
            messages: [
              {
                role: "USER",
                content: newUserMsg.content,
                imagePreview: newUserMsg.imagePreview,
              },
              { role: "ASSISTANT", content: newAiMsg.content },
            ],
          }),
        });
      } catch (e) {
        console.error("Save error:", e);
      }
    },
    [activeChatId, createSession, isSignedIn, openSignIn],
  );
 
  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!isSignedIn) return;
      setSidebarHistory((prev) => {
        const updated = prev.filter((c) => c.id !== chatId);
        if (activeChatId === chatId)
          setActiveChatIdState(updated[0]?.id || null);
        return updated;
      });
      setAllChats((prev) => {
        const n = { ...prev };
        delete n[chatId];
        return n;
      });
      try {
        await fetch(`/chat/api/session/${chatId}`, { method: "DELETE" });
      } catch (e) {
        console.error("deleteChat error:", e);
        await fetchUserHistory();
      }
    },
    [activeChatId, fetchUserHistory, isSignedIn],
  );
 
  const startNewChat = useCallback(() => {
    setActiveChatIdState(null);
  }, []);
 
  return {
    activeChatId,
    setActiveChatId: loadChat,
    allChats,
    sidebarHistory,
    isTyping,
    setIsTyping,
    isLoading,
    isStreaming: false,
    streamingContent: "",
    sendMessage,
    startNewChat,
    refetchHistory: fetchUserHistory,
    deleteChat,
    addVisualResult,
    isSignedIn,
  };
};