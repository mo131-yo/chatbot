"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type SidebarChatItem = {
  id: string;
  title: string;
};

type HistorySession = {
  id: string;
  title: string | null;
  messages: { role: ChatRole; content: string }[];
};

function getGuestChats(): Record<string, ChatMessage[]> {
  try {
    return JSON.parse(localStorage.getItem("guest_chats") || "{}");
  } catch {
    return {};
  }
}

function saveGuestChats(chats: Record<string, ChatMessage[]>) {
  try {
    localStorage.setItem("guest_chats", JSON.stringify(chats));
  } catch {}
}

export const useChatLogic = () => {
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isSignedIn, isLoaded } = useUser();

  const loadChat = useCallback(
    async (chatId: string | null) => {
      if (!chatId) {
        setActiveChatIdState(null);
        return;
      }

      setActiveChatIdState(chatId);

      if (allChats[chatId]) return;

      if (!isSignedIn) {
        const guestChats = getGuestChats();
        if (guestChats[chatId]) {
          setAllChats((prev) => ({ ...prev, [chatId]: guestChats[chatId] }));
        }
        return;
      }

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
          })),
        }));
      } catch (error) {
        console.error("loadChat error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [allChats, isSignedIn]
  );

  const syncUser = useCallback(async () => {
    if (!isSignedIn || !user?.id) return;

    try {
      const res = await fetch("/chat/api/sync-user", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("sync-user failed:", text);
      }
    } catch (error) {
      console.error("sync-user error:", error);
    }
  }, [isSignedIn, user?.id]);

  const fetchUserHistory = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    try {
      setIsLoading(true);

      const res = await fetch("/chat/api/history", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("History fetch failed:", text);
        setSidebarHistory([]);
        setAllChats({});
        return;
      }

      const sessions: HistorySession[] = await res.json();

      const history = sessions.map((s) => ({
        id: s.id,
        title:
          s.title || s.messages?.[0]?.content?.slice(0, 20) || "Шинэ чат",
      }));

      const chatsMap: Record<string, ChatMessage[]> = {};
      sessions.forEach((s) => {
        chatsMap[s.id] = (s.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }));
      });

      setSidebarHistory(history);
      setAllChats(chatsMap);

      setActiveChatIdState((prev) => {
        if (prev && chatsMap[prev]) return prev;
        return history[0]?.id || null;
      });
    } catch (error) {
      console.error("fetchUserHistory error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const run = async () => {
      await syncUser();
      await fetchUserHistory();
    };

    run();
  }, [isLoaded, isSignedIn, user?.id, syncUser, fetchUserHistory]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;

    const guestChats = getGuestChats();
    const ids = Object.keys(guestChats);

    if (ids.length === 0) return;

    const history = ids.map((id) => ({
      id,
      title: guestChats[id]?.[0]?.content?.slice(0, 20) || "Шинэ чат",
    }));

    setSidebarHistory(history);
    setAllChats(guestChats);
    setActiveChatIdState(ids[0]);
  }, [isLoaded, isSignedIn]);

  const createSession = useCallback(
    async (title: string): Promise<{ id: string; title: string }> => {
      if (!isSignedIn) {
        const id = `guest_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        return { id, title };
      }

      const res = await fetch("/chat/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create session");
      }

      return res.json();
    },
    [isSignedIn]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      setIsTyping(true);

      try {
        let chatId = activeChatId;
        if (!chatId) {
          const session = await createSession(message.slice(0, 20) || "Шинэ чат");
          chatId = session.id;

          setActiveChatIdState(chatId);
          setSidebarHistory((prev) => [
            {
              id: session.id,
              title: session.title || message.slice(0, 20) || "Шинэ чат",
            },
            ...prev,
          ]);
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        }

        const nextMessages: ChatMessage[] = [
          ...(allChats[chatId!] || []),
          { role: "USER", content: message },
        ];

        setAllChats((prev) => ({
          ...prev,
          [chatId as string]: nextMessages,
        }));

        if (!isSignedIn) {
          const guestChats = getGuestChats();
          guestChats[chatId!] = nextMessages;
          saveGuestChats(guestChats);
        }

        const res = await fetch("/chat/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role.toLowerCase(),
              content: m.content,
            })),
            chatId,
            userId: user?.id || null,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to send message");
        }

        const data = await res.json();

        const updatedMessages: ChatMessage[] = [
          ...nextMessages,
          { role: "ASSISTANT", content: data.reply },
        ];

        setAllChats((prev) => ({
          ...prev,
          [chatId!]: updatedMessages,
        }));

        if (!isSignedIn) {
          const guestChats = getGuestChats();
          guestChats[chatId!] = updatedMessages;
          saveGuestChats(guestChats);
        }
      } catch (error) {
        console.error("sendMessage error:", error);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, allChats, createSession, isSignedIn, user?.id]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!confirm("Та энэ чатыг устгахдаа итгэлтэй байна уу?")) return;

      try {
        if (isSignedIn) {
          const res = await fetch(`/chat/api/session/${chatId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Устгаж чадсангүй");
        } else {
          const guestChats = getGuestChats();
          delete guestChats[chatId];
          saveGuestChats(guestChats);
        }

        setSidebarHistory((prev) => {
          const updatedHistory = prev.filter((chat) => chat.id !== chatId);
          if (activeChatId === chatId) {
            setActiveChatIdState(updatedHistory[0]?.id || null);
          }
          return updatedHistory;
        });

        setAllChats((prev) => {
          const newChats = { ...prev };
          delete newChats[chatId];
          return newChats;
        });
      } catch (error) {
        console.error("deleteChat error:", error);
      }
    },
    [activeChatId, isSignedIn]
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
    sendMessage,
    startNewChat,
    refetchHistory: fetchUserHistory,
    deleteChat,
  };
};