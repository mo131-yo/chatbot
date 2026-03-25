import { supabase } from "@/lib/api/supabase";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const useChatLogic = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, { role: string; content: string }[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<{ id: string; title: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const savedAllChats = localStorage.getItem("ai_all_chats");
    const savedSidebar = localStorage.getItem("ai_sidebar_history");
    if (savedAllChats) setAllChats(JSON.parse(savedAllChats));
    if (savedSidebar) setSidebarHistory(JSON.parse(savedSidebar));
    
  }, []);

  useEffect(() => {
    localStorage.setItem("ai_all_chats", JSON.stringify(allChats));
    localStorage.setItem("ai_sidebar_history", JSON.stringify(sidebarHistory));
  }, [allChats, sidebarHistory]);

useEffect(() => {
  if (!localStorage.getItem("guest_id")) {
    localStorage.setItem("guest_id", `guest_${crypto.randomUUID()}`);
  }
}, []);

 useEffect(() => {
  const migrateHistory = async () => {
    const guestId = localStorage.getItem("guest_id");
    
    if (isSignedIn && user?.id && guestId) {
      const res = await fetch("/api/auth/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guestId: guestId, 
          realUserId: user.id 
        }),
      });

      if (res.ok) {
        localStorage.removeItem("guest_id");
        console.log("History successfully migrated to your account!");
      }
    }
  };

  migrateHistory();
}, [isSignedIn, user?.id]);
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

// <<<<<<< Updated upstream
//   setIsTyping(true); 
//   const chatId = activeChatId || Date.now().toString();
  
//   const userMessage = { role: "user", content: message };
//   const currentMessages = allChats[chatId] || [];
//   const updatedMessages = [...currentMessages, userMessage];
  
//   setAllChats(prev => ({ ...prev, [chatId]: updatedMessages }));
  
//   if (!activeChatId) {
//     setActiveChatId(chatId);
//     setSidebarHistory(prev => [{ id: chatId, title: message.slice(0, 20) }, ...prev]);
//   }

//   try {
//     const res = await fetch("/chat/api/chat", { 
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ messages: updatedMessages }),
//     });

//     if (!res.ok) throw new Error("API холболт амжилтгүй");

//     const data = await res.json();
    
//     setAllChats(prev => ({
//       ...prev,
//       [chatId]: [...(prev[chatId] || []), { role: "tuslah", content: data.reply }]
//     }));
//   } catch (error) {
//     console.error("Chat error:", error);
//   } finally {
//     setIsTyping(false);
//   }
// };
    setIsTyping(true);

    const guestId = localStorage.getItem("guest_id");
    const userId = user?.id || guestId;

    const chatId = activeChatId || Date.now().toString();
    const userMessage = { role: "user", content: message };
    
    const currentMessages = allChats[chatId] || [];
    const updatedMessages = [...currentMessages, userMessage];

    setAllChats(prev => ({ ...prev, [chatId]: updatedMessages }));

    if (!activeChatId) {
      setActiveChatId(chatId);
      setSidebarHistory(prev => [{ id: chatId, title: message.slice(0, 20) }, ...prev]);
    }

    try {
      const res = await fetch("/chat/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("API холболт амжилтгүй");
      const data = await res.json();
      const aiReply = data.reply;

      setAllChats(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), { role: "assistant", content: aiReply }]
      }));

      const { error } = await supabase
        .from('chat_history')
        .insert([
          { 
            user_id: userId,
            message: message, 
            response: aiReply 
          }
        ]);

      if (error) console.error("Supabase error:", error.message);

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    activeChatId, setActiveChatId,
    allChats, sidebarHistory,
    isTyping, setIsTyping,
    sendMessage,
    handleNewMessage: () => {}
  };
};