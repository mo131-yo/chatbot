import { X } from "lucide-react";

interface HeaderProps {
  title: string;
  onClose: () => void;
}

export const Header = ({ title, onClose }: HeaderProps) => {
  return (
    <div className="p-6 flex justify-between items-center border-b border-white/5">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
      >
        <X size={24} />
      </button>
    </div>
  );
};