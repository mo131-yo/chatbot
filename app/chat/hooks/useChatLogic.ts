// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";

// type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

// type ChatMessage = {
//   role: ChatRole;
//   content: string;
// };

// type SidebarChatItem = {
//   id: string;
//   title: string;
// };

// type HistorySession = {
//   id: string;
//   title: string | null;
//   messages: { role: ChatRole; content: string }[];
// };

// export const useChatLogic = () => {
//   const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
//   const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
//   const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const { user, isSignedIn, isLoaded } = useUser();

//   const loadChat = useCallback(async (chatId: string) => {
//     if (!chatId) return;
//     try {
//       setIsLoading(true);

//       const res = await fetch(`/chat/api/session/${chatId}`, {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("loadChat failed:", text);
//         return;
//       }

//       const session = await res.json();

//       setAllChats((prev) => ({
//         ...prev,
//         [chatId]: (session.messages || []).map((m: any) => ({
//           role: m.role,
//           content: m.content,
//         })),
//       }));

//       setActiveChatIdState(chatId);
//     } catch (error) {
//       console.error("loadChat error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const syncUser = useCallback(async () => {
//     if (!isSignedIn || !user?.id) return;

//     try {
//       const res = await fetch("/chat/api/sync-user", { method: "POST" });

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("sync-user failed:", text);
//       }
//     } catch (error) {
//       console.error("sync-user error:", error);
//     }
//   }, [isSignedIn, user?.id]);

//   const fetchUserHistory = useCallback(async () => {
//     if (!isLoaded || !isSignedIn || !user?.id) return;

//     try {
//       setIsLoading(true);

//       const res = await fetch("/chat/api/history", {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("History fetch failed:", text);
//         setSidebarHistory([]);
//         setAllChats({});
//         return;
//       }

//       const sessions: HistorySession[] = await res.json();

//       const history = sessions.map((s) => ({
//         id: s.id,
//         title: s.title || s.messages?.[0]?.content?.slice(0, 20) || "Шинэ чат",
//       }));

//       const chatsMap: Record<string, ChatMessage[]> = {};
//       sessions.forEach((s) => {
//         chatsMap[s.id] = (s.messages || []).map((m) => ({
//           role: m.role,
//           content: m.content,
//         }));
//       });

//       setSidebarHistory(history);
//       setAllChats(chatsMap);

//       setActiveChatIdState((prev) => {
//         if (prev && chatsMap[prev]) return prev;
//         return history[0]?.id || null;
//       });
//     } catch (error) {
//       console.error("fetchUserHistory error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isLoaded, isSignedIn, user?.id]);

//   useEffect(() => {
//     if (!isLoaded || !isSignedIn || !user?.id) return;

//     const run = async () => {
//       await syncUser();
//       await fetchUserHistory();
//     };

//     run();
//   }, [isLoaded, isSignedIn, user?.id, syncUser, fetchUserHistory]);

//   const createSession = useCallback(async (title: string) => {
//     const res = await fetch("/chat/api/session", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ title }),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(text || "Failed to create session");
//     }

//     return res.json();
//   }, []);

//   const sendMessage = useCallback(
//     async (message: string) => {
//       if (!message.trim()) return;
//       if (!isSignedIn || !user?.id) return;

//       setIsTyping(true);

//       try {
//         let chatId = activeChatId;

//         if (!chatId) {
//           const session = await createSession(
//             message.slice(0, 20) || "Шинэ чат",
//           );
//           chatId = session.id;

//           setActiveChatIdState(chatId);
//           setSidebarHistory((prev) => [
//             {
//               id: session.id,
//               title: session.title || message.slice(0, 20) || "Шинэ чат",
//             },
//             ...prev,
//           ]);
//           setAllChats((prev) => ({
//             ...prev,
//             [chatId!]: [],
//           }));
//         }

//         const nextMessages: ChatMessage[] = [
//           ...(allChats[chatId!] || []),
//           { role: "USER", content: message },
//         ];

//         setAllChats((prev) => ({
//           ...prev,
//           [chatId as string]: nextMessages,
//         }));

//         const res = await fetch("/chat/api/chat", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             messages: nextMessages,
//             chatId,
//             userId: user.id,
//           }),
//         });

//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(text || "Failed to send message");
//         }

//         const data = await res.json();

//         setAllChats((prev) => ({
//           ...prev,
//           [chatId!]: [
//             ...(prev[chatId!] || []),
//             { role: "ASSISTANT", content: data.reply },
//           ],
//         }));
//       } catch (error) {
//         console.error("sendMessage error:", error);
//       } finally {
//         setIsTyping(false);
//       }
//     },
//     [activeChatId, allChats, createSession, isSignedIn, user?.id],
//   );

//   const startNewChat = useCallback(() => {
//     setActiveChatIdState(null);
//   }, []);

//   return {
//     activeChatId,
//     setActiveChatId: loadChat,
//     allChats,
//     sidebarHistory,
//     isTyping,
//     isLoading,
//     sendMessage,
//     startNewChat,
//     refetchHistory: fetchUserHistory,
//   };
// };
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

export const useChatLogic = () => {
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isSignedIn, isLoaded } = useUser();

  const loadChat = useCallback(async (chatId: string) => {
    if (!chatId) return;

    try {
      setIsLoading(true);

      const res = await fetch(`/chat/api/session/${chatId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("loadChat failed:", text);
        return;
      }

      const session = await res.json();

      setAllChats((prev) => ({
        ...prev,
        [chatId]: (session.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }));

      setActiveChatIdState(chatId);
    } catch (error) {
      console.error("loadChat error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        title: s.title || s.messages?.[0]?.content?.slice(0, 20) || "Шинэ чат",
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

  const createSession = useCallback(async (title: string) => {
    const res = await fetch("/chat/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create session");
    }

    return res.json();
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      if (!isSignedIn || !user?.id) return;

      setIsTyping(true);

      try {
        let chatId = activeChatId;

        if (!chatId) {
          const session = await createSession(
            message.slice(0, 20) || "Шинэ чат",
          );

          chatId = session.id;

          setActiveChatIdState(chatId);
          setSidebarHistory((prev) => [
            {
              id: session.id,
              title: session.title || message.slice(0, 20) || "Шинэ чат",
            },
            ...prev,
          ]);

          setAllChats((prev) => ({
            ...prev,
            [chatId as string]: [],
          }));
        }

        if (!chatId) return;

        const nextMessages: ChatMessage[] = [
          ...(allChats[chatId] || []),
          { role: "USER", content: message },
        ];

        setAllChats((prev) => ({
          ...prev,
          [chatId as string]: nextMessages,
        }));

        const res = await fetch("/chat/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages,
            chatId,
            userId: user.id,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to send message");
        }

        const data = await res.json();

        setAllChats((prev) => ({
          ...prev,
          [chatId as string]: [
            ...(prev[chatId as string] || []),
            { role: "ASSISTANT", content: data.reply },
          ],
        }));
      } catch (error) {
        console.error("sendMessage error:", error);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, allChats, createSession, isSignedIn, user?.id],
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
    isLoading,
    sendMessage,
    startNewChat,
    refetchHistory: fetchUserHistory,
  };
};
