"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

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
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Хэрэглэгчийн түүх татах
  const fetchUserHistory = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
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
  }, [isLoaded, isSignedIn, user?.id]);

  // 2. Хэрэглэгч бүртгэх/синк хийх
  const syncUser = useCallback(async () => {
    if (!isSignedIn || !user?.id) return;
    try {
      await fetch("/chat/api/sync-user", { method: "POST" });
    } catch (e) {
      console.error("sync-user error:", e);
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    (async () => {
      await syncUser();
      await fetchUserHistory();
    })();
  }, [isLoaded, isSignedIn, user?.id, syncUser, fetchUserHistory]);

  // 3. Шинэ сесс үүсгэх
  const createSession = useCallback(async (title: string) => {
    const res = await fetch("/chat/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  // 4. Чатыг ачаалах (Load current chat)
  const loadChat = useCallback(
    async (chatId: string | null) => {
      if (!chatId) {
        setActiveChatIdState(null);
        return;
      }
      setActiveChatIdState(chatId);
      if (allChats[chatId]) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/chat/api/session/${chatId}`, { cache: "no-store" });
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
    [allChats]
  );

  // 5. Мессеж илгээх (ЗАСАССАН)
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !isSignedIn || !user?.id) return;
      setIsTyping(true);
      try {
        let chatId = activeChatId;
        
        // Хэрэв идэвхтэй чат байхгүй бол шинээр үүсгэнэ
        if (!chatId) {
          const session = await createSession(message.slice(0, 40) || "Шинэ чат");
          chatId = session.id;
          setActiveChatIdState(chatId);
          setSidebarHistory((prev) => [
            { id: session.id, title: session.title || message.slice(0, 40) },
            ...prev,
          ]);
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        }

        const nextMessages: ChatMessage[] = [
          ...(allChats[chatId!] || []),
          { role: "USER", content: message },
        ];
        
        setAllChats((prev) => ({ ...prev, [chatId!]: nextMessages }));

        const res = await fetch("/chat/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role.toLowerCase(),
              content: m.content,
            })),
            chatId,
            userId: user.id,
          }),
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        setAllChats((prev) => ({
          ...prev,
          [chatId!]: [
            ...(prev[chatId!] || []),
            { role: "ASSISTANT", content: data.reply },
          ],
        }));
      } catch (e) {
        console.error("sendMessage error:", e);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, allChats, createSession, isSignedIn, user?.id]
  );
const addVisualResult = useCallback(
  async (userMsg: any, products: any[]) => {
    let chatId = activeChatId;

    // 1. Session байхгүй бол үүсгэх
    if (!chatId) {
      const title = userMsg.content?.slice(0, 20) || "Зургийн хайлт";
      try {
        const session = await createSession(title);
        chatId = session.id;
        setActiveChatIdState(chatId);
        setSidebarHistory(prev => [{ id: session.id, title }, ...prev]);
        setAllChats(prev => ({ ...prev, [chatId!]: [] }));
      } catch (e) { return; }
    }

    // 2. Хэрэглэгчийн мессеж (Зургийг content дотор биш, тусад нь preview талбарт)
    const newUserMsg: ChatMessage = {
      role: "USER",
      content: userMsg.content || "Зургаар хайж байна...",
      imagePreview: userMsg.imagePreview // Энд Base64 дата байна
    };

    // 3. AI хариулт - Бараануудыг Markdown форматаар бэлдэх
    const productLines = (products || []).map((p: any) => {
      const m = p.metadata || p;
      return `![${m.name}, ${m.price}, ${m.description || ""}, ${p.id || m.id}, ${m.store_id}](${m.image_url || m.image})`;
    }).join("\n");

    const newAiMsg: ChatMessage = { 
      role: "ASSISTANT", 
      content: products.length > 0 
        ? `Зургаас ${products.length} тохирох бараа олдлоо!\n\n${productLines}`
        : "Уучлаарай, тохирох бараа олдсонгүй."
    };

    // 4. State шинэчлэх (Дэлгэц дээр шууд харагдуулна)
    setAllChats(prev => ({
      ...prev,
      [chatId!]: [...(prev[chatId!] || []), newUserMsg, newAiMsg],
    }));

    // 5. Өгөгдлийн санд хадгалах
    try {
      await fetch("/chat/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messages: [
            { role: "USER", content: newUserMsg.content, imagePreview: newUserMsg.imagePreview },
            { role: "ASSISTANT", content: newAiMsg.content }
          ],
        }),
      });
    } catch (e) {
      console.error("Save error:", e);
    }
  },
  [activeChatId, createSession]
);


  // 7. Чат устгах
  const deleteChat = useCallback(
    async (chatId: string) => {
      setSidebarHistory((prev) => {
        const updated = prev.filter((c) => c.id !== chatId);
        if (activeChatId === chatId) setActiveChatIdState(updated[0]?.id || null);
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
    [activeChatId, fetchUserHistory]
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
  };
};