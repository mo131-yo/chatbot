"use client";

import {
  Trash2,
  Edit2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { GiPin } from "react-icons/gi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [filteredChats, setFilteredChats] = useState(history);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [renameTarget, setRenameTarget] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<any>(null);

  const [isRecentOpen, setIsRecentOpen] = useState(true);

  useEffect(() => {
    setFilteredChats(history);
  }, [history]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredChats.length - 1),
        );
      }
      if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        const chat = filteredChats[selectedIndex];
        if (chat) onSelectChat(chat.id);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filteredChats, selectedIndex]);

  if (!history || !Array.isArray(history)) {
    return (
      <div className="flex-1 px-4 py-6 text-xs text-slate-500 italic">
        Түүх байхгүй
      </div>
    );
  }

  const visibleChats = filteredChats.filter(
    (chat) => chat.id !== pendingDelete?.id,
  );
  const pinnedChats = visibleChats.filter((chat) => chat?.isPinned);
  const recentChats = visibleChats.filter((chat) => !chat?.isPinned);

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-1
    ${
      activeChatId === chat.id
        ? "bg-black/10 dark:bg-white/10"
        : "hover:bg-black/5 dark:hover:bg-white/5"
    }`}
    >
      <div
        onClick={() => onSelectChat(chat.id)}
        className="flex items-center gap-2 min-w-0 flex-1"
      >
        {chat.isPinned && (
          <GiPin size={14} className="text-[#C5A059] rotate-45 shrink-0" />
        )}
        <span className="text-sm truncate pr-2">
          {chat.title || "New chat"}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPinChat(chat.id);
          }}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500"
        >
          {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setRenameTarget(chat);
            setRenameValue(chat.title || "");
          }}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(chat);
          }}
          className="p-1 rounded hover:bg-red-500/20 text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="px-3 mb-3">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#C5A059]/50 transition-all"
          onChange={(e) => {
            const value = e.target.value.toLowerCase();
            const filtered = history.filter((chat) =>
              chat.title?.toLowerCase().includes(value),
            );
            setFilteredChats(filtered);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide">
        {pinnedChats.length > 0 && (
          <div className="mb-4">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Pinned
            </p>
            <div className="space-y-0.5">
              {pinnedChats.map((chat) => renderChatItem(chat))}
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          <button
            onClick={() => setIsRecentOpen(!isRecentOpen)}
            className="w-full flex items-center gap-1 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
          >
            <span className="transition-transform duration-200">
              {isRecentOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </span>
            <span>Recent</span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isRecentOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {recentChats.length > 0
              ? recentChats.map((chat) => renderChatItem(chat))
              : pinnedChats.length === 0 && (
                  <p className="px-3 py-2 text-xs text-slate-500 italic text-center">
                    No history yet
                  </p>
                )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#121212] rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs p-6 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold">Устгах уу?</h2>
              <p className="text-sm text-slate-400 mt-1">
                "{deleteTarget.title}" чатыг устгахдаа итгэлтэй байна уу?
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Болих
              </button>
              <button
                onClick={() => {
                  const chatToDelete = deleteTarget;
                  setPendingDelete(chatToDelete);
                  setDeleteTarget(null);
                  const timeout = setTimeout(() => {
                    onDeleteChat(chatToDelete.id);
                    setPendingDelete(null);
                  }, 5000);

                  toast.error(`Чатыг устгалаа`, {
                    action: {
                      label: "Undo",
                      onClick: () => {
                        clearTimeout(timeout);
                        setPendingDelete(null);
                      },
                    },
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setRenameTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#121212] rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Нэр өөрчлөх</h2>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 outline-none focus:border-[#C5A059]/50 transition-all mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameChat(renameTarget.id, renameValue);
                  setRenameTarget(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="flex-1 py-2 rounded-lg text-sm hover:bg-white/5"
              >
                Болих
              </button>
              <button
                onClick={() => {
                  onRenameChat(renameTarget.id, renameValue);
                  toast.success(`Нэр шинэчлэгдлээ`);
                  setRenameTarget(null);
                }}
                className="flex-1 py-2 rounded-lg text-sm bg-[#C5A059] text-black font-bold hover:brightness-110"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
