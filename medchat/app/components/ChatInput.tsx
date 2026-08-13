"use client";
 
import { Brain, Globe, Plus, ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  deepThink: boolean;
  setDeepThink: (val: boolean) => void;
  search: boolean;
  setSearch: (val: boolean) => void;
}

export default function ChatInput({ 
  message, 
  isLoading, 
  onChange, 
  onSend,
  deepThink,
  setDeepThink,
  search,
  setSearch,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea height based on content length
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter, allow Shift+Enter for newlines
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = !!message.trim() && !isLoading;

  const getContainerGlowClass = () => {
    if (deepThink && search) return "both";
    if (deepThink) return "deepthink";
    if (search) return "search";
    return "normal";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-30">
      <div className="w-full max-w-3xl mx-auto">
        <div className={`input-glowing-container ${getContainerGlowClass()} bg-white dark:bg-[#0c1221] rounded-3xl p-3 shadow-md border dark:border-white/5`}>
          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MedChat anything about symptoms, drugs, or research..."
              className="w-full bg-transparent text-[14px] outline-none px-2 py-1 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200 resize-none max-h-40 min-h-[28px] chat-scroll"
            />
 
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
              {/* Feature toggles */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setDeepThink(!deepThink)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    deepThink 
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" 
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DeepThink</span>
                </button>
                <button 
                  onClick={() => setSearch(!search)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    search 
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" 
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
 
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button 
                  aria-label="Attach medical file" 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  aria-label="Send message"
                  onClick={onSend}
                  disabled={!canSend}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    canSend
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-95"
                      : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-default"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer info badge */}
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 px-4 leading-normal">
          MedChat is for research and educational purposes only. It is not a substitute for clinical advice.
        </p>
      </div>
    </div>
  );
}
