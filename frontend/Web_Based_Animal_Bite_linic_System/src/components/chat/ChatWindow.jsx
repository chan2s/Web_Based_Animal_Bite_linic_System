import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Check, X, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI, extractPaginatedData } from '../../api/axios';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ conversation, onBack, showMobileBack = false, onConversationUpdated }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch message history on conversation change
  useEffect(() => {
    if (!conversation) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getMessages(conversation.id);
        setMessages(extractPaginatedData(res.data));
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages, autoScroll]);

  // WebSocket hook
  const handleWsMessage = useCallback((data) => {
    switch (data.type) {
      case 'new_message':
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        if (onConversationUpdated) onConversationUpdated();
        break;

      case 'messages_read':
        setMessages((prev) =>
          prev.map((m) =>
            data.message_ids.includes(m.id)
              ? { ...m, is_read: true, read_by: [{ reader_id: data.read_by }] }
              : m
          )
        );
        break;

      case 'typing':
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (data.is_typing) {
            next[data.user_id] = true;
          } else {
            delete next[data.user_id];
          }
          return next;
        });
        break;

      case 'staff_notification':
        break;
    }
  }, [onConversationUpdated]);

  const { sendMessage, isConnected } = useChatWebSocket(handleWsMessage);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversation && isConnected) {
      sendMessage({
        type: 'conversation_join',
        conversation_id: conversation.id,
      });
    }
  }, [conversation?.id, isConnected, sendMessage]);

  // Send a message — try WebSocket first, fall back to REST API
  const handleSend = useCallback(async (body) => {
    if (!conversation) return false;

    const sent = sendMessage({
      type: 'message',
      conversation_id: conversation.id,
      body,
    });

    if (sent) {
      toast.success('Message sent', {
        duration: 2000,
        style: { background: '#10b981', color: '#fff', fontSize: '13px', padding: '8px 16px' },
        iconTheme: { primary: '#fff', secondary: '#10b981' },
      });
      if (onConversationUpdated) onConversationUpdated();
      return true;
    }

    console.warn('[ChatWindow] WebSocket unavailable, falling back to REST API.');
    try {
      await chatAPI.createMessage(conversation.id, { body });
      const res = await chatAPI.getMessages(conversation.id);
      setMessages(extractPaginatedData(res.data));

      toast.success('Message sent', {
        duration: 2000,
        style: { background: '#10b981', color: '#fff', fontSize: '13px', padding: '8px 16px' },
        iconTheme: { primary: '#fff', secondary: '#10b981' },
      });
      if (onConversationUpdated) onConversationUpdated();
      return true;
    } catch (err) {
      console.error('[ChatWindow] REST API fallback also failed:', err);
      toast.error('Failed to send message. Please try again.', {
        duration: 4000,
        style: { background: '#ef4444', color: '#fff', fontSize: '13px', padding: '8px 16px' },
      });
      return false;
    }
  }, [conversation?.id, sendMessage, isConnected, onConversationUpdated]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping) => {
    if (!conversation) return;

    sendMessage({
      type: 'typing',
      conversation_id: conversation.id,
      is_typing: isTyping,
    });
  }, [conversation?.id, sendMessage]);

  // Group messages by date for separators
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate });
      }
      groups.push({ type: 'message', message: msg });
    });

    return groups;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5 rounded-full bg-blue-50 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Your Messages</h3>
          <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const participant = conversation.participant || {};
  const dateGroups = groupMessagesByDate(messages);
  const isTyping = Object.keys(typingUsers).length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-3.5 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
          {showMobileBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Avatar */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm md:text-sm font-bold text-white">
              {participant.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
              {participant.full_name || 'Clinic Staff'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${conversation.is_online ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className={`text-[11px] md:text-xs leading-none ${conversation.is_online ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                {conversation.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <span className="flex items-center gap-1 text-[11px] md:text-xs text-emerald-600">
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Connected</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] md:text-xs text-amber-500">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Reconnecting...</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 md:px-5 py-3 md:py-4 space-y-1"
        onScroll={() => {
          const el = containerRef.current;
          if (!el) return;
          const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          setAutoScroll(isNearBottom);
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">No messages yet</p>
              <p className="text-xs text-gray-400">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {dateGroups.map((item, idx) =>
              item.type === 'date' ? (
                <div key={`date-${idx}`} className="flex items-center justify-center my-3 md:my-4">
                  <span className="px-3 py-1 text-[11px] md:text-xs font-medium text-gray-500 bg-white rounded-full shadow-sm border border-gray-100">
                    {item.date}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={item.message.id}
                  message={item.message}
                  isOwn={item.message.sender_id === user?.id}
                />
              )
            )}
          </>
        )}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator name={participant.full_name} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!isConnected || !conversation}
      />
    </div>
  );
}
