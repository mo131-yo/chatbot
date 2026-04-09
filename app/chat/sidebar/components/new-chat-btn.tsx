import { FiEdit } from "react-icons/fi";

export const NewChatBtn = ({ onClick }: { onClick: () => void }) => (
  <div className="px-3 py-2">
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
      hover:bg-black/5 dark:hover:bg-white/5 transition"
    >
      <FiEdit className="text-base text-slate-500" />
      <span className="text-sm text-slate-500">New chat</span>
    </button>
  </div>
);
