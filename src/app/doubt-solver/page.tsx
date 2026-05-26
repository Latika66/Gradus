"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { ChatMessage } from "@/types";
import { MessageSquare, Send, Sparkles, Plus, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "How do I transition from frontend to full stack?",
  "What skills should I learn for my first dev job?",
  "How do I prepare for a technical interview?",
  "What's the difference between REST and GraphQL?",
];

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      {!isUser && (
        <div className="relative flex shrink-0 mt-0.5 mr-3">
          <div className="absolute inset-0 rounded-full bg-[#00d4ff] animate-[pulse_4s_ease-in-out_infinite] blur-[2px] opacity-20 scale-90"></div>
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#7928ca] to-[#00d4ff] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-[#7928ca]/20">
            AI
          </div>
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#1a2942] text-white rounded-tr-sm"
            : "bg-white/[0.03] border border-white/[0.05] text-[#e2e8f0] rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className="text-[10px] text-[#475569] mt-2 text-right">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#1a2942] border border-[#2dd4bf]/20 flex items-center justify-center text-xs shrink-0 ml-3 mt-0.5 text-[#2dd4bf]">
          You
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex shrink-0">
        <div className="absolute inset-0 rounded-full bg-[#00d4ff] animate-[pulse_4s_ease-in-out_infinite] blur-[2px] opacity-20 scale-90"></div>
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#7928ca] to-[#00d4ff] flex items-center justify-center text-xs font-bold text-white">
          AI
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-3xl rounded-tl-sm px-5 py-4">
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function DoubtSolverPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Derive the active conversation messages
  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const currentMessages = currentSession ? currentSession.messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isTyping]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setError("");
    setInput("");
    inputRef.current?.focus();
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    let targetSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    // Auto-generate a new session if we are working on a blank slate
    if (!targetSessionId) {
      targetSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: targetSessionId,
        title: content, // Auto-generate title from first user message
        messages: [userMsg],
      };
      updatedSessions = [newSession, ...updatedSessions];
      setSessions(updatedSessions);
      setActiveSessionId(targetSessionId);
    } else {
      // Append to the active existing session
      updatedSessions = updatedSessions.map((s) => {
        if (s.id === targetSessionId) {
          return { ...s, messages: [...s.messages, userMsg] };
        }
        return s;
      });
      setSessions(updatedSessions);
    }

    setInput("");
    setIsTyping(true);
    setError("");

    const activeSess = updatedSessions.find((s) => s.id === targetSessionId);
    const history = activeSess
      ? activeSess.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      : [];

    try {
      const res = await fetch("/api/ai/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.reply,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return { ...s, messages: [...s.messages, aiMsg] };
            }
            return s;
          })
        );
      } else {
        setError(data.error ?? "AI failed to respond. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050816] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[rgba(0,212,255,0.03)] via-transparent to-transparent pointer-events-none" />
      
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-16 relative z-10">
        
        {/* Dynamic Left Sidebar */}
        <div className="hidden lg:flex flex-col w-60 bg-white/[0.01] shadow-[1px_0_10px_rgba(0,0,0,0.1)] border-r border-white/[0.02] p-4 pb-6 shrink-0 relative z-20">
          
          {/* Header */}
          <div className="mb-6 px-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#00d4ff]" />
              <h2 className="font-semibold text-white text-sm">AI Mentor</h2>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Your personal AI guide. Ask anything about tech, learning, or career paths.
            </p>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={startNewChat}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 rounded-xl border border-[rgba(0,212,255,0.3)] bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(121,40,202,0.05)] text-[#00d4ff] text-sm font-medium hover:border-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.08)] transition-all duration-300"
          >
            <Plus className="w-4 h-4 shrink-0" />
            New Chat
          </button>

          {/* Dynamic Chat History Container */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 flex flex-col pr-1">
            <h3 className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-3 px-2">
              Recent Chats
            </h3>
            
            {sessions.length === 0 ? (
              /* Low-opacity centered empty-state layout */
              <div className="flex-1 flex items-center justify-center min-h-[180px] px-2 text-center select-none animate-in fade-in duration-300">
                <p className="text-xs text-[#475569] opacity-50 font-medium tracking-wide italic">
                  No recent conversations yet
                </p>
              </div>
            ) : (
              /* Dynamic render list (Latest chats first) */
              <div className="flex flex-col gap-1">
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setError("");
                      }}
                      className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-sm text-left transition-all duration-300 group ${
                        isActive 
                          ? "bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#e2e8f0] shadow-[0_0_10px_rgba(0,212,255,0.02)]" 
                          : "bg-transparent border border-transparent text-[#94a3b8] hover:bg-white/[0.03] hover:text-[#e2e8f0]"
                      }`}
                    >
                      <MessageSquare 
                        className={`w-[14px] h-[14px] shrink-0 transition-colors ${
                          isActive ? "text-[#00d4ff]" : "text-[#475569] group-hover:text-[#94a3b8]"
                        }`} 
                      />
                      <span className="truncate flex-1 pr-1">{session.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer View All Toggle */}
          {sessions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.05] px-2">
              <button className="flex items-center gap-2 text-xs font-medium text-[#64748b] hover:text-[#00d4ff] transition-colors group">
                View All Chats
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Chat Content Window */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
              
              {currentMessages.length === 0 ? (
                /* Welcome Centered UI state */
                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[400px] animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(121,40,202,0.1)] to-[rgba(0,212,255,0.1)] flex items-center justify-center mb-6 border border-[rgba(0,212,255,0.15)] shadow-[0_0_15px_rgba(0,212,255,0.05)] animate-[pulse_4s_ease-in-out_infinite]">
                    <MessageSquare className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                  <h1 className="text-2xl font-semibold text-white mb-3">How can I help you level up?</h1>
                  <p className="text-sm text-[#64748b] mb-10 text-center max-w-md">
                    Ask questions about career paths, interview prep, learning roadmaps, or resume advice.
                  </p>
                  
                  <div className="w-full max-w-2xl">
                    <p className="text-xs text-[#475569] uppercase tracking-wider mb-5 text-center">Try asking</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-[18px] w-full">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          disabled={isTyping}
                          className="text-left text-sm py-3 px-5 rounded-full border border-white/[0.05] bg-white/[0.01] text-[#94a3b8] hover:-translate-y-[2px] hover:border-[#00d4ff] hover:text-[#e2e8f0] hover:bg-[rgba(0,212,255,0.04)] hover:shadow-[0_4px_15px_rgba(0,212,255,0.05)] transition-all duration-300 disabled:opacity-50 truncate"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Conversation Stream */
                <div className="flex-1 pb-4">
                  {currentMessages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#f87171] text-sm text-center">
                      {error}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Bar Section */}
          <div className="p-4 md:p-6 bg-gradient-to-t from-[#050816] to-transparent">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 items-end bg-[#0f172a]/60 backdrop-blur-md rounded-2xl p-2.5 border border-[rgba(0,212,255,0.2)] focus-within:border-[rgba(0,212,255,0.5)] focus-within:shadow-[0_0_20px_rgba(0,212,255,0.15)] focus-within:bg-[#0f172a]/80 transition-all duration-300">
                <textarea
                  ref={inputRef}
                  id="doubt-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your learning journey..."
                  rows={1}
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder:text-[#475569] outline-none resize-none px-3 py-2 max-h-32 leading-relaxed"
                  style={{ minHeight: "40px" }}
                />
                <button
                  id="doubt-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#7928ca] to-[#00d4ff] rounded-xl text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#475569] mt-3 text-center tracking-wide">
                Shift + Enter for new line · Enter to send
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}