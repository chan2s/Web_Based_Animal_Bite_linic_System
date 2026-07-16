import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquarePlus, MessageCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UnreadBadge from './UnreadBadge';

export default function ChatSidebar({
  conversations = [],
  activeConversationId,
  onSelect,
  onNewChat,
  onSearch,
  loading,
}) {
  const { hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const isStaff = hasRole(['admin', 'doctor', 'nurse', 'staff']);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  }, [onSearch]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) {
      return 'Yesterday';
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Messages</h2>
        <button
          onClick={onNewChat}
          className="p-2.5 md:p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 text-gray-500 hover:text-blue-600 active:scale-95"
          aria-label="New conversation"
        >
          <MessageSquarePlus className="w-5 h-5 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 md:px-4 py-2 md:py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder={isStaff ? 'Search patients...' : 'Search conversations...'}
            className="w-full pl-10 pr-4 py-2.5 md:py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !Array.isArray(conversations) || conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">No conversations yet</p>
            <p className="text-xs text-gray-400 max-w-[200px]">
              {isStaff
                ? 'Search for a patient to start a conversation'
                : 'Tap + to start a conversation with staff'}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {Array.isArray(conversations) && conversations.map((conv, index) => {
              const participant = conv.participant || {};
              const lastMessage = conv.last_message || {};
              const isActive = conv.id === activeConversationId;
              const isOnline = conv.is_online;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`
                    w-full flex items-center gap-3 md:gap-3.5 px-3 md:px-4 py-3 md:py-3.5
                    text-left transition-all duration-150
                    hover:bg-gray-50 active:bg-gray-100
                    ${isActive ? 'bg-blue-50/80 border-l-[3px] border-blue-500' : 'border-l-[3px] border-transparent'}
                    animate-[fade-in_0.2s_ease-out]
                  `}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative shadow-sm">
                    <span className="text-sm md:text-sm font-bold text-white">
                      {participant.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px] border-white shadow-sm" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm md:text-sm font-semibold text-gray-900 truncate">
                        {participant.full_name || 'Clinic Staff'}
                      </span>
                      {lastMessage.created_at && (
                        <span className="text-[11px] leading-none text-gray-400 flex-shrink-0 mt-0.5">
                          {formatTime(lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-xs leading-relaxed truncate flex-1 ${
                        conv.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                      }`}>
                        {lastMessage.body || 'No messages yet'}
                      </p>
                      {conv.unread_count > 0 && (
                        <UnreadBadge count={conv.unread_count} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
