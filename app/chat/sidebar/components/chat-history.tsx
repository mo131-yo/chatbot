"use client";

import { Ellipsis, Trash2, Edit2, Share2, Pin, PinOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GiPin } from "react-icons/gi";
import { useState } from "react";

interface Chat {
  id: string;
  title: string;
  isPinned?: boolean;
}

interface ChatHistoryProps {
  history: Chat[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onPinChat: (id: string) => void;
  onShareChat: (id: string) => void;
  activeChatId?: string | null;
  isLoading?: boolean;
}

export const ChatHistory = ({
  history = [],
  onSelectChat,
  isLoading,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  onShareChat,
  activeChatId,
}: ChatHistoryProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);

  if (!history || !Array.isArray(history)) {
    return (
      <div className="flex-1 px-4 py-6 text-xs text-slate-500 italic">
        Түүх байхгүй
      </div>
    );
  }

  const pinnedChats = history.filter((chat) => chat?.isPinned);
  const recentChats = history.filter((chat) => !chat?.isPinned);

  const handleShareClick = async (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();

    const shareData = {
      title: "AI Chat Хуваалцах",
      text: `"${chat.title || "Шинэ чат"}" яриаг үзээрэй.`,
      url: `${window.location.origin}/chat/${chat.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Холбоосыг санамжинд (clipboard) хууллаа!");
      }
      onShareChat(chat.id);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Хуваалцахад алдаа гарлаа:", error);
    }
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={`group relative flex items-center rounded-lg transition-all mb-1
      ${activeChatId === chat.id ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5"}`}
    >
      <button
        onClick={() => onSelectChat(chat.id)}
        className="flex-1 text-left px-3 py-2.5 flex items-center gap-2 min-w-0"
      >
        {chat.isPinned && (
          <GiPin size={16} className="text-[#C5A059] rotate-45 shrink-0" />
        )}
        <span className="text-sm font-medium truncate pr-6 group-hover:text-[#C5A059]">
          {chat.title || "New Chat"}
        </span>
      </button>

      <div className="absolute right-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center outline-none border-none bg-transparent cursor-pointer text-slate-400 hover:text-white">
            <Ellipsis size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onPinChat(chat.id)}
            >
              {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              {chat.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => {
                const newTitle = prompt("Шинэ нэр:", chat.title);
                if (newTitle) onRenameChat(chat.id, newTitle);
              }}
            >
              <Edit2 size={14} /> Rename
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onShareChat(chat.id)}
            >
              <Share2 size={14} /> Share
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              className="gap-2 text-red-500 focus:text-red-500 cursor-pointer"
              onClick={() => setDeleteTarget(chat)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-2 flex items-center gap-2">
              Pinned
            </p>
            {pinnedChats.map((chat) => renderChatItem(chat))}
            <div className="h-px bg-black/5 dark:bg-white/5 mx-3 my-4" />
          </div>
        )}

        <div className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Your chat history
          </p>
          {recentChats.length > 0
            ? recentChats.map((chat) => renderChatItem(chat))
            : pinnedChats.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-500 italic">
                  No history yet
                </p>
              )}
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-80 p-6 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-1">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Delete chat?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this chat?
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteChat(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
