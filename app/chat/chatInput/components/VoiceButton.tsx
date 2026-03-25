import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const VoiceButton = ({ isRecording, isProcessing, isLoading, onStart, onStop }: any) => (
  <button
    type="button"
    onMouseDown={onStart}
    onMouseUp={onStop}
    onTouchStart={onStart}
    onTouchEnd={onStop}
    disabled={isProcessing || isLoading}
    className={`p-4 rounded-xl transition-all flex items-center justify-center ${
      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-slate-400 hover:text-white"
    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 
     isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
  </button>
);