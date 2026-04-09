"use client";

import { Trash2, Edit2, Pin, PinOff } from "lucide-react";

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
  collapsed?: boolean;
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
  collapsed = false,
}: ChatHistoryProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [renameTarget, setRenameTarget] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<any>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFilteredChats(history);
  }, [history]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => prev + 1);
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

  const visibleChats = history.filter((chat) => chat.id !== pendingDelete?.id);
  const pinnedChats = visibleChats.filter((chat) => chat?.isPinned);
  const recentChats = visibleChats.filter((chat) => !chat?.isPinned);
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-200 dark:bg-yellow-500/40 rounded px-1"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

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
      className={`
      group relative flex items-center
      ${collapsed ? "justify-center px-2" : "justify-between px-3"}
      py-2 rounded-xl cursor-pointer
      transition-all duration-200 ease-out
      active:scale-[0.97]

      ${
        activeChatId === chat.id
          ? "bg-black/10 dark:bg-white/10"
          : "hover:bg-black/5 dark:hover:bg-white/5"
      }
    `}
    >
      {/* 🔥 CLICKABLE AREA */}
      <div
        onClick={() => onSelectChat(chat.id)}
        className={`flex items-center min-w-0 flex-1
        ${collapsed ? "justify-center" : "gap-2"}
      `}
      >
        {collapsed ? (
          chat.isPinned ? (
            <GiPin size={16} className="text-[#C5A059] rotate-45" />
          ) : (
            <span className="text-base">💬</span>
          )
        ) : (
          <>
            {chat.isPinned && (
              <GiPin size={14} className="text-[#C5A059] rotate-45 shrink-0" />
            )}
          </>
        )}

        {/* 📝 TEXT (expanded үед л харагдана) */}
        {!collapsed && (
          <span className="text-sm truncate">
            {highlightText(chat.title || "New chat", search)}
          </span>
        )}
      </div>

      {/* 🔥 ACTION BUTTONS (expanded үед л) */}
      {!collapsed && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinChat(chat.id);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(chat);
            }}
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* 🔥 TOOLTIP (collapsed үед) */}
      {collapsed && (
        <div
          className="
      pointer-events-none
      absolute left-full ml-3 top-1/2 -translate-y-1/2
      bg-black/90 text-white
      dark:bg-white dark:text-black
      px-3 py-2 rounded-lg
      opacity-0 translate-x-[-6px]
      group-hover:opacity-100 group-hover:translate-x-0
      transition-all duration-200
      z-[9999]
      w-max max-w-[220px]
    "
        >
          {chat.title || "New chat"}
        </div>
      )}
    </div>
  );

  return (
    <>
      {!collapsed && (
        <div className="px-3 mb-3">
          <input
            type="text"
            placeholder="Чат хайх..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              if (!value.trim()) {
                setFilteredChats([]);
                return;
              }

              const filtered = history.filter((chat) =>
                chat.title?.toLowerCase().includes(value.toLowerCase()),
              );

              setFilteredChats(filtered);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg 
  bg-black/5 dark:bg-white/5 
  focus:outline-none"
          />
          {search && filteredChats.length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-black/10 dark:border-white/10 max-h-60 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setSearch("");
                    setFilteredChats([]);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer
    hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {chat.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-white/10 ">
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs text-gray-500 mb-2">Pinned</p>
            )}
            {pinnedChats.map((chat) => renderChatItem(chat))}
            <div className="h-px bg-black/5 dark:bg-white/5 mx-3 my-4" />
          </div>
        )}

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs text-gray-500 mt-4 mb-2">Recent</p>
          )}
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
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-1">
                <Trash2 size={18} className="text-red-500" />
              </div>

              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Чатыг устгах уу?
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="block">
                  "
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-55 inline-block align-middle">
                    {deleteTarget.title || "New chat"}
                  </span>
                  "
                </span>
                чатыг устгахдаа итгэлтэй байна уу?
              </p>

              <p className="text-xs text-slate-400">
                Энэ үйлдлийг буцаах боломжгүй.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                  }, 2000);

                  toast.error(
                    `"${chatToDelete.title || "New chat"}" устгах гэж байна`,
                    {
                      action: {
                        label: "Undo",
                        onClick: () => {
                          clearTimeout(timeout);
                          setPendingDelete(null);
                        },
                      },
                    },
                  );
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}
      {renameTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setRenameTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-80 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Чатын нэр өөрчлөх</h2>

            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameChat(renameTarget.id, renameValue);
                  setRenameTarget(null);
                }
              }}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 rounded-lg text-sm hover:bg-black/5"
              >
                Болих
              </button>

              <button
                onClick={() => {
                  onRenameChat(renameTarget.id, renameValue);
                  (toast.success(`Чатын нэр "${renameValue}" боллоо!`),
                    setRenameTarget(null));
                }}
                className="px-4 py-2 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600"
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
