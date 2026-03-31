import { FaTrash } from "react-icons/fa";

interface ChatHistoryProps {
  history: { id: string; title: string }[];
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) =>void | undefined;
  activeChatId?:string | null;
  isLoading?: boolean;
}

export const ChatHistory = ({
  history,
  onSelectChat,
  isLoading,
  onDeleteChat,
  activeChatId
}: ChatHistoryProps) => (
  <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
    <div className="px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">
        History
      </p>
    </div>

    {isLoading ? (
      <div className="space-y-2 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse py-2">
            <div className="w-4 h-4 bg-white/10 rounded-full" />
            <div className="h-3 bg-white/10 rounded w-full" />
          </div>
        ))}
      </div>
    ) : !history || history.length === 0 ? (
      <p className="px-4 py-2 text-xs text-slate-600 italic">No chats</p>
    ) : (
      history.map((chat) => (
        <div 
          key={chat.id} 
          className={`group relative flex items-center rounded-lg transition-all 
            ${activeChatId === chat.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
        >
          <button
            onClick={() => onSelectChat(chat.id)}
            className="flex-1 text-left px-4 py-3 flex items-center gap-3 min-w-0"
          >
            <span className="material-symbols-outlined text-slate-600 group-hover:text-[#C5A059] text-sm transition-colors">
              chat_bubble
            </span>
            <span className="text-sm font-light text-slate-400 group-hover:text-slate-200 transition-colors truncate pr-6">
              {chat.title}
            </span>
          </button>
          <button
           onClick={(e) => {
            e.stopPropagation();
            if (confirm("Энэ яриаг устгах уу?")) {
              onDeleteChat?.(chat.id);
            }
            }}
            className="absolute right-2 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Delete chat"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ))
    )}
  </div>
);