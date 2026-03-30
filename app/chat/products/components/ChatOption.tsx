interface MessageProps {
  message: {
    role: string;
    content: string;
    options?: string[];
  };
  onOptionClick: (option: string) => void;
}

const ChatMessage = ({ message, onOptionClick }: MessageProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`max-w-[80%] ${isAssistant ? "text-left" : "text-right"}`}>
        <div className={`p-4 rounded-2xl inline-block ${
          isAssistant ? "bg-white/10 text-white" : "bg-[#C5A059] text-black font-medium"
        }`}>
          {message.content}
        </div>

        {isAssistant && message.options && message.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-start">
            {message.options.map((opt, index) => (
              <button
                key={index}
                onClick={() => onOptionClick(opt)}
                className="px-4 py-2 border border-[#C5A059] text-[#C5A059] rounded-full 
                           hover:bg-[#C5A059] hover:text-black transition-all text-sm animate-fade-in"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};