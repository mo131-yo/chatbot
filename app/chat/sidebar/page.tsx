"use client";

import { NewChatBtn, ChatHistory } from "./components";

interface SidebarProps {
  isCollapsed: boolean;
  history: { id: string; title: string }[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export default function Sidebar ({ isCollapsed, history, onNewChat, onSelectChat }: SidebarProps){
  return (
    <aside 
      className={`flex flex-col h-screen relative z-20 transition-all duration-300 ease-in-out bg-white dark:bg-[#0D0D0D] border-r border-black/10 dark:border-white/5 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
      }`}
    >
      <NewChatBtn onClick={onNewChat} />

      <ChatHistory history={history} onSelectChat={onSelectChat} />

    </aside>
  );
};