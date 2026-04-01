// export const NewChatBtn = ({ onClick }: { onClick: () => void }) => (
//   <div className="p-6">
//     <button
//       onClick={onClick}
//       className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#C5A059]/30 rounded-xl hover:bg-[#C5A059]/5 transition-all group"
//     >
//       <span className="material-symbols-outlined text-[#C5A059] text-lg">
//         add
//       </span>
//       <span className="text-sm font-light tracking-widest uppercase text-slate-300 group-hover:text-[#C5A059] transition-colors">
//         New Chat
//       </span>
//     </button>
//   </div>
// );
"use client";

interface NewChatBtnProps {
  onClick: () => void;
}

export const NewChatBtn = ({ onClick }: NewChatBtnProps) => {
  return (
    <div className="p-6">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#C5A059]/30 rounded-xl hover:bg-[#C5A059]/5 transition-all group"
      >
        <span className="material-symbols-outlined text-[#C5A059] text-lg">
          add
        </span>
        <span className="text-sm font-light tracking-widest uppercase text-slate-300 group-hover:text-[#C5A059] transition-colors">
          New Chat
        </span>
      </button>
    </div>
  );
};
