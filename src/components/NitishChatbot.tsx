import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Minus,
  Maximize2,
  ExternalLink,
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
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [avatarLoadError, setAvatarLoadError] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'model',
      text: INITIAL_GREETING,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages]);

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

  // Avatar element renderer with graceful inline fallback
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
    <aside
      aria-label="Er. Nitish AI Mentor Assistant"
      className="select-none pointer-events-auto"
    >
      {/* 1. FLOATING TRIGGER: ONLY ROUND CIRCLE + 'SAY HI!' BADGE IN HIGHLIGHT COLORS */}
      {!isOpen && (
        <div
          id="er-nitish-ai-trigger-container"
          className="fixed left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center group cursor-pointer"
        >
          {/* Highlight Badge on Top: 'Say Hi! 👋' with radiant gradient & bounce */}
          <div
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="mb-1.5 animate-bounce flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white text-[11px] sm:text-xs font-black shadow-lg shadow-orange-500/30 border border-white/80 transition-transform active:scale-95 select-none"
            title="Click to Say Hi to Er. Nitish!"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="tracking-wide drop-shadow-xs">Say Hi! 👋</span>
          </div>

          {/* Pure Round Circle Avatar Button */}
          <button
            type="button"
            id="er-nitish-ai-chat-trigger"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white cursor-pointer flex items-center justify-center"
            title="Er. Nitish (AI Mentor) - Click to chat"
            aria-label="Chat with Er. Nitish"
          >
            {/* Subtle glowing animated ring */}
            <span className="absolute -inset-1 rounded-full bg-blue-400/30 blur-xs animate-pulse -z-10" />

            {/* Inner avatar circular wrapper */}
            <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5 shadow-inner">
              {renderAvatar('w-full h-full')}
            </div>

            {/* Online Green Pulse Indicator */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </button>
        </div>
      )}

      {/* 2. MINIMIZED STATE: COMPACT ROUND CIRCLE WITH EXPAND & CLOSE BADGE */}
      {isOpen && isMinimized && (
        <div
          id="er-nitish-ai-chat-minimized"
          className="fixed left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1.5 animate-scaleUp"
        >
          {/* Circular resume button */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-900 shadow-xl border-2 border-white/90 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
            title="Resume chat with Er. Nitish"
            aria-label="Resume chat"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
              {renderAvatar('w-full h-full')}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
            {/* Restore icon overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-blue-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Maximize2 className="w-4 h-4" />
            </div>
          </button>

          {/* Quick close button for minimized mode */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="w-7 h-7 rounded-full bg-white/90 text-slate-500 hover:text-red-500 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Close chat completely"
            aria-label="Close chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. REDUCED & VIEWPORT-SAFE CHAT WINDOW (FIT SAFELY ON ALL MOBILE & DESKTOP SCREENS) */}
      {isOpen && !isMinimized && (
        <div
          id="er-nitish-ai-chat-window"
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-[calc(100vw-1rem)] max-w-[325px] sm:w-[335px] h-[450px] max-h-[72vh] sm:max-h-[490px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-scaleUp transition-all"
        >
          {/* Header (Compact, always inside viewport) */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-3 py-2 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/10 p-0.5 border border-white/20 overflow-hidden">
                  {renderAvatar('w-full h-full')}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>Er. Nitish</span>
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                </h3>
                <p className="text-[10px] text-blue-200/80 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  AI Academic Mentor
                </p>
              </div>
            </div>

            {/* Header Actions: Reset, Minimise, Close */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Restart conversation */}
              <button
                type="button"
                onClick={handleResetChat}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Restart conversation"
                aria-label="Restart chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimise Option Button */}
              <button
                type="button"
                id="er-nitish-ai-chat-minimize"
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                id="er-nitish-ai-chat-close"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body (Compact, clean readability) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-slate-50/70 overscroll-contain">
            {messages.map((msg) => {
              const isBot = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-1.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200">
                      {renderAvatar('w-full h-full')}
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-xl px-2.5 py-1.5 text-[11.5px] shadow-2xs leading-relaxed break-words ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs font-medium'
                    }`}
                  >
                    {isBot ? (
                      <div className="prose prose-xs max-w-none text-slate-800 space-y-1">
                        <Markdown
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-900">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-3.5 space-y-0.5 my-0.5 text-slate-700">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-3.5 space-y-0.5 my-0.5 text-slate-700">{children}</ol>
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
                              <code className="bg-slate-100 text-blue-700 px-1 py-0.2 rounded font-mono text-[10px]">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.text}
                        </Markdown>

                        {/* WhatsApp support shortcut if fallback message is shown */}
                        {msg.text.includes('WhatsApp support') && (
                          <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                            <a
                              href="https://wa.me/919753000000?text=Hi%20Er.%20Nitish,%20I%20need%20help%20with%20NTechBay%20Library"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                            {onOpenContact && (
                              <button
                                type="button"
                                onClick={onOpenContact}
                                className="text-[11px] text-blue-600 font-semibold underline cursor-pointer p-0.5"
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
                      className={`block text-[8.5px] mt-0.5 text-right ${
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

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-1.5">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200">
                  {renderAvatar('w-full h-full')}
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl rounded-tl-xs px-2.5 py-1.5 shadow-2xs flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="text-[10px] text-slate-400 ml-1">Typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips without any ugly browser scrollbar */}
          <div
            className="no-scrollbar px-2 pt-1.5 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto touch-pan-x shrink-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 active:bg-blue-100 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Compact Input Area */}
          <div className="p-2 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Er. Nitish..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />

              <button
                type="submit"
                id="er-nitish-send-button"
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 px-0.5">
              <span>Powered by Gemini</span>
              <span>Er. Nitish Khobragade (NK)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
