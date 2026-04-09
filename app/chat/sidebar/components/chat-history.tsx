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
import { useEffect, useState, useMemo } from "react";
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
  collapsed?: boolean;
}

export const ChatHistory = ({
  history = [],
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  activeChatId,
  collapsed = false,
}: ChatHistoryProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);
  const [renameTarget, setRenameTarget] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isRecentOpen, setIsRecentOpen] = useState(true);

  // Filter out chats that are in the "Undo" deletion state
  const visibleHistory = useMemo(() => 
    history.filter((chat) => chat.id !== pendingDeleteId), 
  [history, pendingDeleteId]);

  // Derived state for pinned/recent
  const pinnedChats = visibleHistory.filter((chat) => chat?.isPinned);
  const recentChats = visibleHistory.filter((chat) => !chat?.isPinned);

  // Search logic
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return history.filter((chat) =>
      chat.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, history]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-500/40 rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={chat.id}
      className={`
      group relative flex items-center
      ${collapsed ? "justify-center px-2" : "justify-between px-3"}
      py-2 rounded-xl cursor-pointer transition-all duration-200
      ${activeChatId === chat.id ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}
    `}
    >
      <div
        onClick={() => onSelectChat(chat.id)}
        className={`flex items-center min-w-0 flex-1 ${collapsed ? "justify-center" : "gap-2"}`}
      >
        {chat.isPinned ? (
          <GiPin size={16} className="text-[#C5A059] rotate-45 shrink-0" />
        ) : (
          collapsed && <span className="text-base">💬</span>
        )}

        {!collapsed && (
          <span className="text-sm truncate">
            {highlightText(chat.title || "New chat", search)}
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => { e.stopPropagation(); onPinChat(chat.id); }}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenameTarget(chat);
              setRenameValue(chat.title || "");
            }}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(chat); }}
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {collapsed && (
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black text-white dark:bg-white dark:text-black px-3 py-2 rounded-lg opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-[9999] w-max max-w-[220px]">
          {chat.title || "New chat"}
        </div>
      )}
    </div>
  );

  return (
    <>
      {!collapsed && (
        <div className="px-3 mb-3 relative">
          <input
            type="text"
            placeholder="Чат хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-black/5 dark:bg-white/5 focus:outline-none"
          />
          {search && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 mt-1 z-50 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-black/10 dark:border-white/10 max-h-60 overflow-y-auto">
              {searchResults.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setSearch("");
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {chat.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-none">
        {/* PINNED SECTION */}
        {pinnedChats.length > 0 && (
          <div className="mb-4">
            {!collapsed && <p className="px-3 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Pinned</p>}
            {pinnedChats.map(renderChatItem)}
            {!collapsed && <div className="h-px bg-black/5 dark:bg-white/5 mx-3 mt-4" />}
          </div>
        )}

        {/* RECENT SECTION */}
        <div>
          {!collapsed && (
            <button 
              onClick={() => setIsRecentOpen(!isRecentOpen)}
              className="w-full flex items-center justify-between px-3 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span>Recent</span>
              {isRecentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          <div className={`space-y-1 transition-all duration-300 ${isRecentOpen ? "opacity-100" : "hidden"}`}>
            {recentChats.length > 0 ? (
              recentChats.map(renderChatItem)
            ) : (
              pinnedChats.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-500 italic text-center">No history yet</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold">Устгах уу?</h2>
                <p className="text-sm text-slate-400 mt-1">"{deleteTarget.title}" чатыг устгахдаа итгэлтэй байна уу?</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm">Болих</button>
                <button
                  onClick={() => {
                    const id = deleteTarget.id;
                    setPendingDeleteId(id);
                    setDeleteTarget(null);
                    const timeout = setTimeout(() => {
                      onDeleteChat(id);
                      setPendingDeleteId(null);
                    }, 3000);

                    toast.error("Чатыг устгалаа", {
                      action: { label: "Undo", onClick: () => { clearTimeout(timeout); setPendingDeleteId(null); } },
                    });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold"
                >
                  Устгах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setRenameTarget(null)}>
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Нэр өөрчлөх</h2>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 outline-none mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameChat(renameTarget.id, renameValue);
                  setRenameTarget(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={() => setRenameTarget(null)} className="flex-1 py-2 rounded-lg text-sm">Болих</button>
              <button
                onClick={() => {
                  onRenameChat(renameTarget.id, renameValue);
                  toast.success("Нэр шинэчлэгдлээ");
                  setRenameTarget(null);
                }}
                className="flex-1 py-2 rounded-lg text-sm bg-[#C5A059] text-black font-bold"
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