export const SidebarFooter = () => (
  <div className="p-6 border-t border-black/5 dark:border-white/5 mt-auto">
    <button className="flex items-center gap-3 w-full p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors group">
      <div className="size-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-[#C5A059] transition-colors">
          settings
        </span>
      </div>
      <span className="text-sm text-slate-400 group-hover:text-slate-200">Settings</span>
    </button>
  </div>
);