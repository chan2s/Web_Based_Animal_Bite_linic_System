import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { AnimatePresence } from 'framer-motion';
import { chatAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { showError } from '../../hooks/useToast';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import { MessageSquare, ChevronLeft, WifiOff } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // ── Deduplicate messages by id / tempId ──
  const dedupeMessages = (msgs) =>
    Array.from(new Map(msgs.map((m) => [m.id ?? m.tempId ?? m._id, m])).values());

  // ── WebSocket message handler ──
  const handleWsMessage = useCallback((msg) => {
    if (msg.type === 'new_message' || msg.message) {
      const newMsg = msg.message || msg;
      setMessages((prev) => {
        // Only add if not already present (checked by id or tempId)
        const key = newMsg.id ?? newMsg.tempId ?? newMsg._id;
        if (!key || prev.some((m) => (m.id ?? m.tempId ?? m._id) === key)) return prev;
        return [...prev, newMsg];
      });
      // Refresh sidebar conversation list to update last-message / unread
      refreshConversations();
    }
  }, []);

  const { isConnected, sendMessage, connectionStatus } = useChatWebSocket(handleWsMessage);

  // ── Initial load ──
  useEffect(() => {
    refreshConversations();
  }, []);

  // ── Auto-refresh when connection is restored ──
  useEffect(() => {
    if (isOnline) {
      refreshConversations();
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
    }
  }, [isOnline]);

  // ── Load messages when active conversation changes ──
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // ── Auto-scroll to bottom on new messages (unless user is reading history) ──
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages, autoScroll]);

  const refreshConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      // Normalize response: could be plain array, { results: [...] }, or { conversations: [...] }
      const data = res.data;
      const conversationsList = Array.isArray(data)
        ? data
        : data?.results || data?.conversations || [];
      setConversations(conversationsList);
    } catch (e) {
      console.error('Failed to load conversations:', e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await chatAPI.getMessages(conversationId);
      const data = res.data;
      const messagesList = Array.isArray(data)
        ? data
        : data?.results || data?.messages || [];
      setMessages(messagesList);
    } catch (e) {
      console.error('Failed to load messages:', e);
      setMessages([]);
    }
  };

  const handleSend = async (content, attachment) => {
    if (!activeConversation || (!content.trim() && !attachment)) return;
    
    // Don't attempt to send when offline
    if (!isOnline) {
      showError('You are offline. Messages cannot be sent.');
      return false;
    }

    setSending(true);
    try {
      // Send via WebSocket — the server broadcasts a 'new_message' event back
      const wsSent = sendMessage({
        type: 'message',
        conversation_id: activeConversation.id,
        body: content.trim(),
      });

      if (!wsSent) {
        // WebSocket unavailable — fall back to REST API
        console.warn('[ChatPage] WebSocket unavailable, falling back to REST API.');
        await chatAPI.createMessage(activeConversation.id, { body: content.trim() });
        // Re-fetch messages so the new message appears in the UI
        await fetchMessages(activeConversation.id);
        refreshConversations();
      }
    } catch (e) {
      if (e?.offline) {
        showError('No internet connection. Please reconnect and try again.');
      } else {
        showError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  // ── Memoize deduplicated messages to avoid re-processing on every render ──
  const uniqueMessages = useMemo(() => dedupeMessages(messages), [messages]);

  const participant =
    activeConversation?.participant ||
    (activeConversation?.participant_name
      ? { full_name: activeConversation.participant_name }
      : {});

  return (
    <div className="h-[calc(100dvh-64px-56px)] flex gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* ── Conversation List (Sidebar) ── */}
      <div
        className={`
          w-full md:w-72 lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${showMobileList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${showMobileList ? 'block' : 'hidden md:flex'}
          absolute md:relative inset-y-0 left-0 z-20 md:z-auto
          ${!showMobileList ? 'md:block' : ''}
        `}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelect={(convId) => {
            const conv = conversations.find((c) => c.id === convId);
            if (conv) {
              setActiveConversation(conv);
              setShowMobileList(false);
            }
          }}
          loading={loading}
          currentUser={user}
        />
      </div>

      {/* ── Mobile overlay when sidebar is showing ── */}
      {showMobileList && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setShowMobileList(false)}
        />
      )}

      {/* ── Active Conversation Panel ── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${!showMobileList ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${!showMobileList ? 'block' : 'hidden md:flex'}
          relative
        `}
      >
        {activeConversation ? (
          <>
            {/* ── Chat Header ── */}
            <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 border-b border-slate-200 bg-white flex-shrink-0 sticky top-0 z-10 shadow-sm">
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all active:scale-95"
                onClick={handleBackToList}
                aria-label="Back to conversations"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {participant.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                {activeConversation.is_online && !isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-400 border-[2.5px] border-white shadow-sm" />
                )}
                {activeConversation.is_online && isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-[2.5px] border-white shadow-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base text-slate-900 truncate">
                  {participant.full_name || activeConversation.participant_name || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isOnline
                    ? activeConversation.is_online ? 'Online' : 'Offline'
                    : 'You are offline'
                  }
                </p>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-3 md:px-5 py-3 md:py-4 space-y-1 bg-slate-50/50"
              onScroll={(e) => {
                const el = e.currentTarget;
                const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
                setAutoScroll(isNearBottom);
              }}
            >
              <AnimatePresence initial={false}>
                {uniqueMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id ?? msg.tempId ?? msg._id}
                    message={msg}
                    isOwn={msg.sender === user?.id || msg.sender_id === user?.id}
                  />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* ── Offline Warning ── */}
            {!isOnline && (
              <div className="px-4 md:px-5 py-3 bg-red-50 border-t border-red-200 flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium text-red-700">
                  You are offline. Messages cannot be sent.
                </span>
              </div>
            )}

            {/* ── Input ── */}
            <ChatInput
              onSend={handleSend}
              disabled={sending || !isOnline}
            />
          </>
        ) : (
          /* ── Empty state (no active conversation) ── */
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Your Messages</h3>
              <p className="text-sm text-slate-400 max-w-[240px] mx-auto">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
