"use client";

import { Ellipsis, Trash2, Edit2, Share2, Pin, PinOff } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  history,
  onSelectChat,
  isLoading,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  onShareChat,
  activeChatId
}: ChatHistoryProps) => {
  
  const pinnedChats = history.filter(chat => chat.isPinned);
  const recentChats = history.filter(chat => !chat.isPinned);

  const renderChatItem = (chat: Chat) => (
    <div 
      key={chat.id} 
      className={`group relative flex items-center rounded-lg transition-all mb-1
        ${activeChatId === chat.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}
    >
      <button
        onClick={() => onSelectChat(chat.id)}
        className="flex-1 text-left px-4 py-2.5 flex items-center gap-3 min-w-0"
      >
        {chat.isPinned && <Pin size={12} className="text-blue-400 fill-blue-400 shrink-0" />}
        <span className="text-sm font-light truncate pr-8 group-hover:text-slate-200">
          {chat.title || "New Chat"}
        </span>
      </button>

      <div className="absolute right-1">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Ellipsis size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onPinChat(chat.id)}>
              {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              {chat.isPinned ? "Бэхлэхгүй" : "Бэхлэх"}
            </DropdownMenuItem>
            
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
              const newTitle = prompt("Шинэ нэр:", chat.title);
              if (newTitle) onRenameChat(chat.id, newTitle);
            }}>
              <Edit2 size={14} /> Нэр өөрчлөх
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onShareChat(chat.id)}>
              <Share2 size={14} /> Хуваалцах
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-800" />
            
            <DropdownMenuItem 
              className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
              onClick={() => confirm("Энэ яриаг устгах уу?") && onDeleteChat(chat.id)}
            >
              <Trash2 size={14} /> Устгах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-3 space-y-4 py-4 custom-scrollbar">
      {isLoading ? (
        <div className="animate-pulse space-y-3 px-2">
          {[1, 2, 3].map(i => <div key={i} className="h-9 bg-white/5 rounded-lg" />)}
        </div>
      ) : (
        <>
          {pinnedChats.length > 0 && (
            <div>
              <p className="px-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Save</p>
              {pinnedChats.map(renderChatItem)}
            </div>
          )}
          
          <div>
            <p className="px-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Сүүлийн</p>
            {recentChats.length > 0 ? recentChats.map(renderChatItem) : (
              <p className="px-4 py-2 text-xs text-slate-600 italic">Түүх байхгүй</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};