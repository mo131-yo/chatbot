import { FiEdit } from "react-icons/fi";

export const NewChatBtn = ({ onClick }: { onClick: () => void }) => (
  <div className="px-3 py-4">
    <button
      onClick={onClick}
      className="flex items-center justify-start gap-4 px-5 py-3 w-full rounded-full bg-gray-100 dark:bg-[#1e1f20] hover:text-black hover:bg-gray-300 dark:hover:bg-[#2e2f30] transition-all group shadow-md">
      <FiEdit 
        className="text-slate-400 group-hover:text-white transition-colors text-[18px] shrink-0" 
        strokeWidth={2.5}
      />
      
      <span className="text-[14px] font-medium text-slate-400 group-hover:text-white transition-colors whitespace-nowrap ">
        New chat
      </span>
    </button>
  </div>
);