"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ChatMessage, ChatSession, AuthUser, getUser } from "../lib/api";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

// Fallback UUID generator for non-HTTPS mobile environments
const generateUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Advanced toggles & search states
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Bootstrap: load user + sessions on mount
  useEffect(() => {
    setMounted(true);
    const user = getUser();
    if (user) {
      setAuthUser(user);
      loadSessions();
    }
    setCurrentSessionId(generateUUID());
  }, []);

  const loadSessions = async () => {
    try {
      setSessions(await api.getAllSessions());
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(generateUUID());
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const loadSession = async (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
    try {
      setMessages(await api.getSessionMessages(id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = (idToDelete: string) => {
    // Locally filter sessions to simulate deletion
    setSessions((prev) => prev.filter((s) => s.id !== idToDelete));
    if (currentSessionId === idToDelete) {
      startNewChat();
    }
  };

  const handleSelectSuggestion = (suggestionText: string) => {
    setMessage(suggestionText);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    // Redirect unauthenticated users to login
    if (!authUser) return router.push("/login");

    const userMsg = message.trim();
    setMessage("");
    setIsLoading(true);

    // Optimistically append the user message locally in its clean form
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMsg, timestamp: new Date().toISOString() },
    ]);

    // Append instructional guidance based on selected modes for the LLM
    let apiPrompt = userMsg;
    if (deepThinkEnabled && searchEnabled) {
      apiPrompt += "\n\n[Mode: DeepThink + Web Search. Please provide comprehensive, deep step-by-step diagnostic reasoning, mechanism of action, reference current clinical guidelines, and cite literature where possible.]";
    } else if (deepThinkEnabled) {
      apiPrompt += "\n\n[Mode: DeepThink. Please provide highly detailed, step-by-step diagnostic reasoning, pathophysiological breakdown, and clinical considerations.]";
    } else if (searchEnabled) {
      apiPrompt += "\n\n[Mode: Web Search. Please act as if searching real-time databases like PubMed, Cochrane, and clinical trials. Cite guidelines and general medical literature findings.]";
    }

    try {
      const res = await api.sendMessage(currentSessionId, apiPrompt);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "ai", role: "assistant", content: res.reply, timestamp: res.timestamp },
      ]);
      loadSessions(); // refresh sidebar in case a new session was created
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch from theme
  if (!mounted) return null;

  // Filter sessions locally based on sidebar search input
  const filteredSessions = sessions.filter((s) =>
    (s.summary || "New Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={filteredSessions}
        currentSessionId={currentSessionId}
        authUser={authUser}
        onNewChat={startNewChat}
        onLoadSession={loadSession}
        onDeleteSession={handleDeleteSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="flex flex-col h-screen w-full gradient-bg text-foreground overflow-hidden">
        <ChatHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNewChat={startNewChat}
          deepThinkActive={deepThinkEnabled}
          searchActive={searchEnabled}
        />

        <main className="flex-1 flex flex-col overflow-y-auto px-4 md:px-20 lg:px-48 relative chat-scroll">
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            onSelectSuggestion={handleSelectSuggestion}
          />
        </main>

        <ChatInput
          message={message}
          isLoading={isLoading}
          onChange={setMessage}
          onSend={handleSend}
          deepThink={deepThinkEnabled}
          setDeepThink={setDeepThinkEnabled}
          search={searchEnabled}
          setSearch={setSearchEnabled}
        />
      </div>
    </>
  );
}
