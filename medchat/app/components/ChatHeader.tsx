"use client";

import { Menu, SquarePen, ShieldAlert, Sparkles, Globe } from "lucide-react";

interface ChatHeaderProps {
  onOpenSidebar: () => void;
  onNewChat: () => void;
  deepThinkActive?: boolean;
  searchActive?: boolean;
}

export default function ChatHeader({ 
  onOpenSidebar, 
  onNewChat,
  deepThinkActive = false,
  searchActive = false,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white bg-slate-50/20 dark:bg-black/10 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Status flags */}
        <div className="flex items-center gap-2 max-sm:hidden">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Secure Session
          </div>
          {deepThinkActive && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold uppercase">
              <Sparkles className="w-3 h-3" />
              Thinking Mode
            </div>
          )}
          {searchActive && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-semibold uppercase">
              <Globe className="w-3 h-3" />
              Web Search
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">
          MedChat Assistant
        </h1>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Llama-3.3 Research Agent
        </p>
      </div>

      <button
        onClick={onNewChat}
        aria-label="New chat"
        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
      >
        <SquarePen className="w-5 h-5" />
      </button>
    </header>
  );
}
