// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { ChatHistory } from "./chat-history";

// type ChatItem = {
//   id: string;
//   title: string;
// };

// export default function Sidebar() {
//   const [history, setHistory] = useState<ChatItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchHistory = useCallback(async () => {
//     try {
//       setLoading(true);

//       const res = await fetch("/api/chat/history", {
//         method: "GET",
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || "Failed to fetch history");
//       }

//       setHistory(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("History fetch error:", error);
//       setHistory([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchHistory();
//   }, [fetchHistory]);

//   const handleSelectChat = async (id: string) => {
//     try {
//       const res = await fetch(`/api/chat/session/${id}`, {
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || "Failed to load session");
//       }

//       console.log("selected chat session:", data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   if (loading) {
//     return <div className="p-4 text-sm text-slate-500">Loading...</div>;
//   }

//   return <ChatHistory history={history} onSelectChat={handleSelectChat} />;
// }
"use client";

import { NewChatBtn } from "./new-chat-btn";
import { ChatHistory } from "./chat-history";

type ChatItem = {
  id: string;
  title: string;
};

interface SidebarProps {
  isCollapsed: boolean;
  history: ChatItem[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isLoading?: boolean;
}

export default function Sidebar({
  isCollapsed,
  history,
  onNewChat,
  onSelectChat,
  isLoading = false,
}: SidebarProps) {
  return (
    <aside
      className={`flex flex-col h-screen relative z-20 transition-all duration-300 ease-in-out bg-white dark:bg-[#0D0D0D] border-r border-black/10 dark:border-white/5 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
      }`}
    >
      <NewChatBtn onClick={onNewChat} />
      <ChatHistory
        history={history}
        onSelectChat={onSelectChat}
        isLoading={isLoading}
      />
    </aside>
  );
}
