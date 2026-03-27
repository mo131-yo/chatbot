interface ChatHistoryProps {
  history: { id: string; title: string }[];
  onSelectChat: (id: string) => void;
  isLoading?: boolean;
}

export const ChatHistory = ({ history, onSelectChat, isLoading }: ChatHistoryProps) => (
  <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
    <div className="px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">
        Recent Curations
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
        <button 
          key={chat.id} 
          onClick={() => onSelectChat(chat.id)}
          className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all group flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-slate-600 group-hover:text-[#C5A059] text-sm transition-colors">
            chat_bubble
          </span>
          <span className="text-sm font-light text-slate-400 group-hover:text-slate-200 transition-colors truncate">
            {chat.title}
          </span>
        </button>
      ))
    )}
  </div>
);