import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minus, Bot, MessageSquare, Trash2, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBotInput from './ChatBotInput';
import ChatBotMessage from './ChatBotMessage';
import SuggestedQuestions, { QuickToggle, InitialSuggestions } from './SuggestedQuestions';
import { getLocalResponse, saveConversation, loadConversation, clearConversation } from './ChatBotKnowledge';

// ─── Inline scrollbar styles ──────────────────────────────────────────────

const scrollbarStyles = `
  .chatbot-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .chatbot-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .chatbot-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 8px;
  }
  .chatbot-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

// ─── Typing Indicator ─────────────────────────────────────────────────────

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2.5 px-5 mb-3"
    >
      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-blue-500" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Contact Staff CTA ─────────────────────────────────────────────────────

function ContactStaffCTA() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="px-5 pb-4"
    >
      <button
        onClick={() => {
          window.location.href = isLoggedIn ? '/chat' : '/login';
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-label="Contact clinic staff"
      >
        <MessageSquare className="w-4 h-4" />
        {isLoggedIn ? 'Open Staff Chat' : 'Log In to Contact Staff'}
      </button>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 shadow-sm">
        <Bot className="w-8 h-8 text-blue-600" />
      </div>
      <h4 className="text-base font-semibold text-gray-900 mb-1.5">
        Hello! How can I help you?
      </h4>
      <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
        I can answer questions about animal bites, vaccinations, clinic services, and more. Just type your question below!
      </p>
    </div>
  );
}

// ─── Ask Another Question Prompt ──────────────────────────────────────────

function AskAnotherPrompt({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
      className="flex items-center gap-3 px-5 pb-2"
    >
      <span className="text-[11px] text-gray-400 font-medium">Need anything else?</span>
      <button
        onClick={onClick}
        className="
          flex items-center gap-1.5
          px-2.5 py-1.5
          text-xs font-semibold
          text-blue-600
          bg-blue-50
          rounded-lg
          hover:bg-blue-100 hover:text-blue-700
          transition-all duration-200
          active:scale-95
        "
      >
        <Lightbulb className="w-3 h-3 text-amber-500" />
        Ask Another Question
      </button>
    </motion.div>
  );
}

// ─── Main Chat Window ──────────────────────────────────────────────────────

export default function ChatBotWindow({ onClose, onMinimize }) {
  const [messages, setMessages] = useState(() => loadConversation());
  const [sending, setSending] = useState(false);
  const [showQuickPanel, setShowQuickPanel] = useState(false);
  const [showContactCTA, setShowContactCTA] = useState(false);
  const [showAskPrompt, setShowAskPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLenRef = useRef(0);

  // Whether this is a fresh conversation (no messages yet)
  const isFirstOpen = messages.length === 0;

  // Auto-focus input when window first opens
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    if (messages.length > prevMessagesLenRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  // Persist conversation to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(messages);
    }
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    setShowQuickPanel(false);
    setShowAskPrompt(false);
    setShowContactCTA(false);
    setSending(true);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Typing delay (0.5–1 second)
    const typingDelay = 500 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    const result = getLocalResponse(text);
    const assistantMsg = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: result.response,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    // Show "Ask Another Question" prompt after bot response
    setShowAskPrompt(true);

    if (result.shouldContactStaff) {
      setShowContactCTA(true);
    }

    setSending(false);
  }, []);

  const handleSuggestedQuestion = useCallback((question) => {
    handleSend(question);
  }, [handleSend]);

  const handleNewConversation = useCallback(() => {
    clearConversation();
    setMessages([]);
    setShowQuickPanel(false);
    setShowContactCTA(false);
    setShowAskPrompt(false);
  }, []);

  const handleToggleQuickPanel = useCallback(() => {
    setShowQuickPanel((prev) => !prev);
    setShowAskPrompt(false);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <style>{scrollbarStyles}</style>

      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              Animal Bite Clinic Assistant
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-blue-100 font-medium">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-100 hover:text-white"
              aria-label="New conversation"
              title="New conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-100 hover:text-white"
            aria-label="Minimize chat"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-100 hover:text-white"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ Messages Area ═══ */}
      <div className="flex-1 overflow-y-auto chatbot-scrollbar">
        <div className="py-4">
          {/* Empty state */}
          <AnimatePresence>
            {isFirstOpen && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message list */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ChatBotMessage message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* "Ask Another Question" prompt (after each bot response) */}
          <AnimatePresence>
            {showAskPrompt && (
              <AskAnotherPrompt onClick={handleToggleQuickPanel} />
            )}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {sending && <TypingDots />}
          </AnimatePresence>

          {/* Contact staff CTA */}
          <AnimatePresence>
            {showContactCTA && <ContactStaffCTA />}
          </AnimatePresence>

          {/* Initial suggestions (shown on first open before any messages) */}
          <AnimatePresence>
            {isFirstOpen && (
              <motion.div
                key="initial-suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: 0.15 }}
              >
                <InitialSuggestions onSelect={handleSuggestedQuestion} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categorized Quick Panel (reopenable at any time) */}
          {!isFirstOpen && (
            <AnimatePresence>
              {!showQuickPanel ? (
                <motion.div
                  key="quick-toggle"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-1"
                >
                  <QuickToggle isOpen={false} onClick={handleToggleQuickPanel} />
                </motion.div>
              ) : (
                <motion.div
                  key="quick-panel-wrapper"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* Close handle at top of panel */}
                  <div className="flex items-center justify-between px-5 pt-1 pb-0">
                    <QuickToggle isOpen={true} onClick={handleToggleQuickPanel} />
                  </div>
                  <SuggestedQuestions
                    onSelect={handleSuggestedQuestion}
                    isExpanded={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ═══ Input Area ═══ */}
      <div className="flex-shrink-0 border-t border-gray-200/80 bg-white">
        <ChatBotInput onSend={handleSend} disabled={sending} ref={inputRef} />
      </div>
    </div>
  );
}
