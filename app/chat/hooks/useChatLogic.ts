import { useState, useEffect } from "react";

export const useChatLogic = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, { role: string; content: string }[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<{ id: string; title: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedAllChats = localStorage.getItem("ai_all_chats");
    const savedSidebar = localStorage.getItem("ai_sidebar_history");
    if (savedAllChats) setAllChats(JSON.parse(savedAllChats));
    if (savedSidebar) setSidebarHistory(JSON.parse(savedSidebar));
  }, []);

  useEffect(() => {
    if (Object.keys(allChats).length > 0) {
      localStorage.setItem("ai_all_chats", JSON.stringify(allChats));
    }
    localStorage.setItem("ai_sidebar_history", JSON.stringify(sidebarHistory));
  }, [allChats, sidebarHistory]);

  const sendMessage = async (message: string) => {
  if (!message.trim()) return;

  setIsTyping(true); 
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
    
    setAllChats(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), { role: "tuslah", content: data.reply }]
    }));
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
    handleNewMessage: (u: string, a: string) => {}
  };
};