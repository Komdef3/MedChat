"use client";
 
import { Bot, Search, PanelLeftClose, MessageSquarePlus, Sun, Moon, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { AuthUser, ChatSession, clearAuth } from "../../lib/api";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  authUser: AuthUser | null;
  onNewChat: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  authUser,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop overlay — closes sidebar on click */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel flex flex-col border-r border-slate-200/50 dark:border-white/5 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: logo + close button */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div 
            onClick={() => { onNewChat(); onClose(); }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500/20 flex items-center justify-center text-white dark:text-blue-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="tracking-tight text-slate-800 dark:text-white">medChat</span>
          </div>
          <button 
            aria-label="Close sidebar" 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-2">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New Medical Chat
          </button>
        </div>

        {/* Live Search bar inside sidebar */}
        <div className="px-3 py-1 relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-transparent focus:border-blue-500 dark:focus:border-blue-500/40 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200 transition-all"
          />
        </div>

        {/* Scrollable past chats list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 sidebar-scroll">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">History</h3>
            {sessions.length > 0 && (
              <span className="text-[10px] bg-slate-200/60 dark:bg-white/5 px-1.5 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-medium">
                {sessions.length}
              </span>
            )}
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No sessions found
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li 
                  key={session.id}
                  onMouseEnter={() => setHoveredSessionId(session.id)}
                  onMouseLeave={() => setHoveredSessionId(null)}
                  className="relative group"
                >
                  <button
                    onClick={() => { onLoadSession(session.id); onClose(); }}
                    className={`w-full text-left pl-3 pr-10 py-2.5 rounded-xl text-xs font-medium truncate transition-all ${
                      currentSessionId === session.id 
                        ? "bg-slate-200/80 dark:bg-white/10 text-blue-600 dark:text-white" 
                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {session.summary || "New Medical Chat"}
                  </button>
                  {/* Delete button (shows on hover or always on touch/mobile) */}
                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition-all ${
                        hoveredSessionId === session.id ? "opacity-100" : "opacity-0 max-md:opacity-100"
                      }`}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: user info + theme toggle + logout */}
        <div className="p-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center gap-2.5">
            {authUser ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm">
                  {authUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col truncate max-w-28">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{authUser.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Researcher</span>
                </div>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in to save chats
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {authUser && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-200/60 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
