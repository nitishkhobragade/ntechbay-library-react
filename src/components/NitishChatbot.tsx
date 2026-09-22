import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  HelpCircle,
  BookOpen,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { sendChatMessage, ChatMessage } from '../services/geminiChatService';

// Cute Boy Cartoon Avatar URL (Young Indian engineer with stylish glasses & smile)
const AVATAR_IMAGE_URL =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nitish&skinColor=edb98a&top=shortCurly&hairColor=2c1b18&facialHairProbability=0&clothing=collarAndSweater&clothingColor=2563eb&accessories=prescription02&accessoriesProbability=100&eyes=happy&eyebrows=defaultNatural&mouth=smile';

const INITIAL_GREETING = `Namaste! 🙏 Main **Er. Nitish Khobragade**, Founder & Developer of NTechBay Library.

RGPV B.Tech, Polytechnic, M.Tech ya MBA ke **Syllabus**, **PYQs**, **Topper Notes** ya **Exam Strategy** ke bare me kuch bhi puchiye! Main aapki poori madad karunga. 😊`;

const SUGGESTION_CHIPS = [
  'Syllabus kaise download karein?',
  'Previous Year Papers (PYQs)',
  'M.Tech resources',
  'RGPV exam tips',
  'Contact Admin',
];

interface NitishChatbotProps {
  onOpenContact?: () => void;
}

export const NitishChatbot: React.FC<NitishChatbotProps> = ({ onOpenContact }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState<boolean>(true);
  const [avatarLoadError, setAvatarLoadError] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'model',
        text: INITIAL_GREETING,
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnreadNotice(false);
      // Autofocus input
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(query, messages);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackText =
        err.message ||
        'Abhi connection me thodi dikkat hai, kripya 1 minute baad dobara puchiye ya WhatsApp support use karein!';

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: fallbackText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: INITIAL_GREETING,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Avatar element renderer with graceful inline SVG fallback
  const renderAvatar = (sizeClass: string = 'w-9 h-9') => {
    if (avatarLoadError) {
      return (
        <div
          className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0`}
        >
          NK
        </div>
      );
    }

    return (
      <img
        src={AVATAR_IMAGE_URL}
        alt="Er. Nitish Cartoon Avatar"
        referrerPolicy="no-referrer"
        onError={() => setAvatarLoadError(true)}
        className={`${sizeClass} rounded-full object-cover bg-amber-50 shrink-0 border border-white/80 shadow-2xs`}
      />
    );
  };

  return (
    <aside aria-label="Er. Nitish AI Mentor Assistant" className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Toggle Button & Animated Say Hi Badge */}
      {!isOpen && (
        <div className="relative flex flex-col items-end group">
          {/* Animated Callout Badge */}
          {hasUnreadNotice && (
            <div
              onClick={() => setIsOpen(true)}
              className="mb-2 cursor-pointer animate-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold shadow-lg border border-blue-200/80 hover:bg-blue-50 transition-all"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Say Hi! 👋</span>
              <span className="text-blue-600 font-semibold">Ask Er. Nitish</span>
            </div>
          )}

          {/* Main Round Avatar Trigger Button */}
          <button
            type="button"
            id="er-nitish-ai-chat-trigger"
            onClick={() => setIsOpen(true)}
            className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-1 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer group"
            title="Chat with Er. Nitish (AI Mentor)"
            aria-label="Open AI Mentor Chatbot"
          >
            {/* Pulsing ring */}
            <span className="absolute -inset-1 rounded-full bg-blue-500/20 blur-xs animate-pulse -z-10" />

            {/* Avatar inside circle */}
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
              {renderAvatar('w-full h-full')}
            </div>

            {/* Online indicator badge */}
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>

            {/* Small icon bubble indicator */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      )}

      {/* Expanded Chat Window Card */}
      {isOpen && (
        <div
          id="er-nitish-ai-chat-window"
          className="w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-scaleUp transition-all"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-3.5 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 p-0.5 border border-white/20 overflow-hidden">
                  {renderAvatar('w-full h-full')}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    Er. Nitish (Founder & AI Mentor)
                  </h3>
                </div>
                <p className="text-[11px] text-blue-200/80 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NTechBay Library Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="er-nitish-ai-chat-close"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat window"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => {
              const isBot = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200">
                      {renderAvatar('w-full h-full')}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs font-medium'
                    }`}
                  >
                    {isBot ? (
                      <div className="prose prose-xs max-w-none text-slate-800 space-y-1.5">
                        <Markdown
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-900">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 space-y-0.5 my-1 text-slate-700">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 space-y-0.5 my-1 text-slate-700">{children}</ol>
                            ),
                            li: ({ children }) => <li className="leading-tight">{children}</li>,
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
                              >
                                {children}
                                <ExternalLink className="w-2.5 h-2.5 inline" />
                              </a>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono text-[11px]">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.text}
                        </Markdown>

                        {/* WhatsApp support shortcut if fallback message is shown */}
                        {msg.text.includes('WhatsApp support') && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <a
                              href="https://wa.me/919753000000?text=Hi%20Er.%20Nitish,%20I%20need%20help%20with%20NTechBay%20Library"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Open WhatsApp Support</span>
                            </a>
                            {onOpenContact && (
                              <button
                                type="button"
                                onClick={onOpenContact}
                                className="text-[11px] text-blue-600 font-semibold underline cursor-pointer"
                              >
                                Contact Form
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isBot ? 'text-slate-400' : 'text-blue-200'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator while waiting for AI response */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200">
                  {renderAvatar('w-full h-full')}
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="text-[11px] text-slate-400 ml-1">Er. Nitish typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Apna sawal yaha likhein / Ask anything..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />

              <button
                type="submit"
                id="er-nitish-send-button"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Powered by Google Gemini</span>
              <span>Er. Nitish Khobragade (NK)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
