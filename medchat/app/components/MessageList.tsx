"use client";

import { useRef, useEffect, useState } from "react";
import {
  Bot,
  User,
  Activity,
  Pill,
  BookOpen,
  FileText,
  Clipboard,
  Check,
  Volume2,
  VolumeX,
  ShieldAlert
} from "lucide-react";
import { ChatMessage } from "../../lib/api";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectSuggestion?: (text: string) => void;
}

export default function MessageList({ messages, isLoading, onSelectSuggestion }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleSpeech = (id: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (activeSpeechId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Remove technical prompts or system tags if any
    const cleanText = text.replace(/Warning: This is AI-generated information.*/gi, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setActiveSpeechId(null);
    };
    utterance.onerror = () => {
      setActiveSpeechId(null);
    };

    speechUtteranceRef.current = utterance;
    setActiveSpeechId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Basic formatter to render bold texts, lists, and clinical warning banners nicely
  const formatContent = (content: string, msgId: string) => {
    // If the text contains the standard Llama disclaimer, separate it out
    const disclaimerRegex = /(Warning:\s*This\s*is\s*AI-generated\s*information\s*for\s*research\s*purposes\s*only\.\s*Always\s*consult\s*a\s*licensed\s*healthcare\s*professional\s*for\s*clinical\s*decisions\.)/i;
    const parts = content.split(disclaimerRegex);

    return (
      <div className="space-y-3.5">
        {parts.map((part, index) => {
          if (disclaimerRegex.test(part)) {
            // Render disclaimer as a professional security block
            return (
              <div
                key={index}
                className="mt-4 p-3 rounded-xl border border-red-200/40 dark:border-red-500/10 bg-red-50/50 dark:bg-red-500/5 flex gap-2.5 items-start text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed animate-fade-in"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{part}</span>
              </div>
            );
          }

          // Format normal text lines
          const lines = part.split("\n");
          return (
            <div key={index} className="space-y-1.5 text-[14px] leading-relaxed">
              {lines.map((line, lIdx) => {
                let trimmed = line.trim();

                // Bullet points
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                  const rawItem = trimmed.substring(2);
                  return (
                    <ul key={lIdx} className="list-disc pl-5 my-1 space-y-1 text-slate-700 dark:text-slate-300">
                      <li>{renderBold(rawItem)}</li>
                    </ul>
                  );
                }

                // Numbered lists
                const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
                if (numMatch) {
                  return (
                    <ol key={lIdx} className="list-decimal pl-5 my-1 space-y-1 text-slate-700 dark:text-slate-300">
                      <li>{renderBold(numMatch[2])}</li>
                    </ol>
                  );
                }

                return <p key={lIdx} className="text-slate-700 dark:text-slate-200">{renderBold(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper to parse `**bold**` within string
  const renderBold = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const suggestions = [
    {
      icon: Activity,
      title: "Symptom Analysis",
      desc: "Pathways for 45yo patient with fever & cough",
      prompt: "A 45-year-old patient presents with dry cough, low-grade fever, and fatigue for 5 days. What diagnostic pathways should be explored?"
    },
    {
      icon: Pill,
      title: "Drug Interactions",
      desc: "Warfarin, acetaminophen, and aspirin",
      prompt: "Analyze potential pharmacological interactions between warfarin, acetaminophen, and aspirin. Note mechanism of action and risk factors."
    },
    {
      icon: BookOpen,
      title: "Explain Pathophysiology",
      desc: "Left ventricular hypertrophy mechanisms",
      prompt: "Detail the cellular mechanisms and cardiac remodeling pathways associated with chronic left ventricular hypertrophy."
    },
    {
      icon: FileText,
      title: "Clinical Trial Review",
      desc: "Cardiovascular effects: SGLT2i vs GLP-1 RA",
      prompt: "Summarize recent landmark trials comparing SGLT2 inhibitors and GLP-1 receptor agonists in diabetic cardiovascular outcomes."
    }
  ];

  /* Empty state — shown before any message is sent */
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8 max-w-3xl mx-auto w-full px-4 text-slate-800 dark:text-white">
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 breathing-logo">
            <Bot className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">MedChat Research Hub</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Secure AI-powered clinical intelligence and pharmacological research.
            </p>
          </div>
        </div>

        {/* Suggestion Grid */}
        <div className="w-full">
          <h3 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-3 text-center">
            Suggested Clinical Prompts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {suggestions.map((sug, idx) => {
              const Icon = sug.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion?.(sug.prompt)}
                  className="text-left p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{sug.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                    {sug.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-6 pb-24 px-1 text-slate-800 dark:text-white">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3.5 w-full ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
        >
          {/* Avatar on the left for assistant messages */}
          {msg.role === "assistant" && (
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 shrink-0 flex items-center justify-center shadow-md shadow-blue-500/5">
              <Bot className="w-4 h-4" />
            </div>
          )}

          {/* Message bubble wrapper */}
          <div className="flex flex-col gap-1 max-w-[85%]">
            {/* Bubble */}
            <div
              className={`px-4 py-3 rounded-2xl shadow-sm ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm shadow-blue-600/10"
                  : "bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-tl-sm text-slate-800 dark:text-slate-100"
                }`}
            >
              {msg.role === "user" ? (
                <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                formatContent(msg.content, msg.id)
              )}
            </div>

            {/* Quick Actions (Copy, TTS) for AI responses */}
            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 pl-1.5 mt-0.5 text-slate-400 dark:text-slate-500">
                <button
                  onClick={() => copyToClipboard(msg.id, msg.content)}
                  className="p-1 hover:text-slate-800 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => toggleSpeech(msg.id, msg.content)}
                  className={`p-1 hover:text-slate-800 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${activeSpeechId === msg.id ? "text-blue-500 dark:text-blue-400" : ""
                    }`}
                  title={activeSpeechId === msg.id ? "Stop voice" : "Read aloud"}
                >
                  {activeSpeechId === msg.id ? (
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User initials avatar on the right for user messages */}
          {msg.role === "user" && (
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-white/5 text-blue-600 dark:text-slate-300 shrink-0 flex items-center justify-center font-bold text-xs shadow-sm max-sm:hidden">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator while waiting for AI response */}
      {isLoading && (
        <div className="flex gap-3.5 justify-start">
          <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 shrink-0 flex items-center justify-center shadow-md shadow-blue-500/5">
            <Bot className="w-4 h-4" />
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-tl-sm flex items-center">
            <div className="flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Invisible anchor for auto-scroll */}
      <div ref={endRef} />
    </div>
  );
}
