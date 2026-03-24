"use client";

interface SidebarProps {
  isCollapsed: boolean;
  history: { id: string; title: string }[];
  onNewChat: () => void;
  onSelectChat:(id:string)=>void
}

export const Sidebar = ({ isCollapsed, history, onNewChat, onSelectChat}: SidebarProps) => {
  return (
    <aside 
      className={`bg-[#161616] border-r border-white/5 flex flex-col h-screen relative z-20 transition-all duration-300 ease-in-out bg-white border-black dark:bg-black ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72"
      }`}
    >
      <div className="p-6">
        <button onClick={onNewChat} className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#C5A059]/30 rounded-xl hover:bg-[#C5A059]/5 transition-all group">
          <span className="material-symbols-outlined text-[#C5A059] text-lg">add</span>
          <span className="text-sm font-light tracking-widest uppercase text-slate-300 group-hover:text-[#C5A059] transition-colors">
            New Chat
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        <div className="px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium">Recent Curations</p>
        </div>
        
        {history.length === 0 ? (
          <p className="px-4 py-2 text-xs text-slate-600 italic">No chats</p>
        ) : (
          history.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => onSelectChat(chat.id)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-all group flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-slate-600 group-hover:text-[#C5A059] text-sm transition-colors">chat_bot</span>
              <span className="text-sm font-light text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                {chat.title}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="p-6 border-t border-white/5 mt-auto">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg transition-colors group">
          <div className="size-8 rounded-full border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg text-slate-400">settings</span>
          </div>
        </button>
      </div>
    </aside>
  );
};