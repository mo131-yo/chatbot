"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";

type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";
type ChatMessage = { role: ChatRole; content: string; imagePreview?: string };
type SidebarChatItem = { id: string; title: string };
type HistorySession = {
  id: string;
  title: string | null;
  messages: { role: ChatRole; content: string }[];
};

const GUEST_KEY = "guest_chats";

function getGuestChats(): Record<string, ChatMessage[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveGuestChats(chats: Record<string, ChatMessage[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(chats));
  } catch {}
}

export const useChatLogic = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const isMigrating = useRef(false);

  const syncUser = useCallback(async () => {
    if (!isSignedIn || !user?.id) return;
    try {
      await fetch("/chat/api/sync-user", { method: "POST" });
    } catch (e) {
      console.error("sync-user error:", e);
    }
  }, [isSignedIn, user?.id]);


  const migrateGuestChats = useCallback(async () => {
    if (!isSignedIn || !user?.id || isMigrating.current) return;

    const guestChats = getGuestChats();
    const ids = Object.keys(guestChats);
    if (!ids.length) return;

    isMigrating.current = true;
    console.log(`🔄 Migrating ${ids.length} guest chats to your account...`);

    for (const guestId of ids) {
      if (!guestId.startsWith("guest_")) continue;

      const messages = guestChats[guestId];
      if (!messages?.length) continue;
      const title = messages[0]?.content?.slice(0, 40) || "Зочин чат";

      try {
        const sessionRes = await fetch("/chat/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!sessionRes.ok) continue;
        const session = await sessionRes.json();

        const saveRes = await fetch(`/chat/api/session/${session.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });

        if (saveRes.ok) {
          const currentGuests = getGuestChats();
          delete currentGuests[guestId];
          saveGuestChats(currentGuests);
        }
      } catch (e) {
        console.error("Migration error for chat:", guestId, e);
      }
    }
    isMigrating.current = false;
  }, [isSignedIn, user?.id]);

  

  const fetchUserHistory = useCallback(async () => {
    if (!isSignedIn) return;
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
        title: s.title || s.messages?.[0]?.content?.slice(0, 40) || "Шинэ чат",
      }));
      
      const chatsMap: Record<string, ChatMessage[]> = {};
      sessions.forEach((s) => {
        chatsMap[s.id] = (s.messages || []).map((m) => ({ 
          role: m.role, 
          content: m.content 
        }));
      });

      setSidebarHistory(history);
      setAllChats(chatsMap);
      
      setActiveChatIdState((prev) => (prev && chatsMap[prev] ? prev : history[0]?.id || null));
    } catch (e) {
      console.error("fetchUserHistory error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);


  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      (async () => {
        await syncUser();
        await migrateGuestChats();
        await fetchUserHistory();
      })();
    } else {
      const g = getGuestChats();
      const ids = Object.keys(g);
      const history = ids.map(id => ({
        id,
        title: g[id]?.[0]?.content?.slice(0, 40) || "Шинэ чат"
      }));
      setSidebarHistory(history);
      setAllChats(g);
      setActiveChatIdState(ids[0] || null);
    }
  }, [isLoaded, isSignedIn, user?.id, syncUser, migrateGuestChats, fetchUserHistory]);


  const loadChat = useCallback(async (chatId: string | null) => {
    if (!chatId) {
      setActiveChatIdState(null);
      return;
    }
    setActiveChatIdState(chatId);
    if (allChats[chatId]) return;

    if (!isSignedIn) {
      const g = getGuestChats();
      if (g[chatId]) setAllChats(prev => ({ ...prev, [chatId]: g[chatId] }));
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/chat/api/session/${chatId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const session = await res.json();
      setAllChats((prev) => ({
        ...prev,
        [chatId]: (session.messages || []).map((m: any) => ({ role: m.role, content: m.content })),
      }));
    } catch (e) {
      console.error("loadChat error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [allChats, isSignedIn]);


  const createSession = useCallback(async (title: string) => {
    if (!isSignedIn) {
      const id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return { id, title };
    }
    const res = await fetch("/chat/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [isSignedIn]);


  const sendMessage = useCallback(async (message: string) => {
    const text = message.trim();
    if (!text) return;

    setStreamingContent("");
    setIsTyping(true);
    setIsStreaming(false);

    try {
      let chatId = activeChatId;
      if (!chatId) {
        const session = await createSession(text.slice(0, 40));
        chatId = session.id;
        setActiveChatIdState(chatId);
        setSidebarHistory((prev) => [{ id: session.id, title: session.title || text.slice(0, 40) }, ...prev]);
        setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
      }

      const nextMessages: ChatMessage[] = [
        ...(allChats[chatId!] || []),
        { role: "USER", content: text },
      ];
      setAllChats((prev) => ({ ...prev, [chatId!]: nextMessages }));

      if (!isSignedIn) {
        const g = getGuestChats();
        g[chatId!] = nextMessages;
        saveGuestChats(g);
      }

      const res = await fetch("/chat/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role.toLowerCase(), content: m.content })),
          chatId,
          userId: user?.id || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let accumulated = "";
      let firstChunk = true;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                if (firstChunk) {
                  firstChunk = false;
                  setIsTyping(false);
                  setIsStreaming(true);
                }
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              }
            } catch {}
          }
        }
      }

      const finalMessages: ChatMessage[] = [
        ...nextMessages,
        { role: "ASSISTANT", content: accumulated },
      ];
      setAllChats((prev) => ({ ...prev, [chatId!]: finalMessages }));

      if (!isSignedIn) {
        const g = getGuestChats();
        g[chatId!] = finalMessages;
        saveGuestChats(g);
      }
    } catch (error) {
      console.error("sendMessage error:", error);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [activeChatId, allChats, createSession, isSignedIn, user?.id]);



 const addVisualResult = useCallback(async (userMsg: any, products: any[]) => {
  let chatId = activeChatId;
  
  if (!chatId) {
    const session = await createSession("Зургаар хайлт");
    chatId = session.id;
    setActiveChatIdState(chatId);
    setSidebarHistory(prev => [{ id: session.id, title: "Зургаар хайлт" }, ...prev]);
    setAllChats(prev => ({ ...prev, [chatId!]: [] }));
  }

  const imagePreviewUrl = typeof userMsg === "object" && userMsg.type === "image"
    ? userMsg.content 
    : null;

  const productLines = products.map(p =>
    `![${p.product_name || p.name}, ${p.formatted_price || p.price}, ${p.description || ""}, ${p.id}, ${p.store_id || "store-default"}](SEARCH_IMAGE_PLACEHOLDER)`
  ).join("\n");

  const aiContent = products.length > 0
    ? `Зургаас ${products.length} тохирох бараа олдлоо!\n\n${productLines}`
    : "Уучлаарай, тохирох бараа олдсонгүй.";

  const newMessages: ChatMessage[] = [
    ...(allChats[chatId!] || []),
    { role: "USER" as ChatRole, content: "", imagePreview: imagePreviewUrl || undefined },
    { role: "ASSISTANT" as ChatRole, content: aiContent },
  ];

  setAllChats(prev => ({ ...prev, [chatId!]: newMessages }));

  if (!isSignedIn) {
    const g = getGuestChats();
    g[chatId!] = newMessages;
    saveGuestChats(g);
  }
}, [activeChatId, allChats, createSession, isSignedIn]);


  const deleteChat = useCallback(async (chatId: string) => {
    if (!confirm("Та энэ чатыг устгахдаа итгэлтэй байна уу?")) return;
    try {
      if (isSignedIn && !chatId.startsWith("guest_")) {
        const res = await fetch(`/chat/api/session/${chatId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Устгаж чадсангүй");
      } else {
        const g = getGuestChats();
        delete g[chatId];
        saveGuestChats(g);
      }
      
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
    } catch (e) {
      console.error("deleteChat error:", e);
    }
  }, [activeChatId, isSignedIn]);

  const startNewChat = useCallback(() => {
    setActiveChatIdState(null);
    setStreamingContent("");
  }, []);

  return {
    activeChatId,
    setActiveChatId: loadChat,
    allChats,
    setAllChats,
    sidebarHistory,
    isTyping,
    isStreaming,
    isLoading,
    streamingContent,
    sendMessage,
    startNewChat,
    refetchHistory: fetchUserHistory,
    deleteChat,
    addVisualResult
  };
};