import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, AlertCircle, Smile } from 'lucide-react';

const MAX_CHARS = 5000;
const EMOJIS = ['😊', '😂', '❤️', '👍', '🙏', '😢', '😍', '🤔', '🎉', '✨', '💯', '🔥'];

export default function ChatInput({ onSend, onTyping, disabled }) {
  const [body, setBody] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setBody(value);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, isMobile ? 100 : 120) + 'px';
    }

    if (onTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  }, [onTyping, isMobile]);

  const handleSend = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed || disabled || sending) return;

    setSendError('');
    setSending(true);

    try {
      const result = await onSend(trimmed);

      if (result === false) {
        setSendError('Message failed to send. Check your connection and try again.');
        return;
      }

      setBody('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onTyping) {
        onTyping(false);
      }
    } catch (err) {
      console.error('[ChatInput] Send error:', err);
      setSendError('An unexpected error occurred while sending.');
    } finally {
      setSending(false);
    }
  }, [body, disabled, onSend, onTyping, sending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const insertEmoji = useCallback((emoji) => {
    setBody((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 md:px-5 py-2.5 md:py-3">
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="mb-2 p-2 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="grid grid-cols-6 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send error banner */}
      {sendError && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-xs md:text-sm text-red-700 flex-1">{sendError}</span>
          <button
            onClick={() => setSendError('')}
            className="text-red-400 hover:text-red-600 text-xs font-medium flex-shrink-0 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-xl md:rounded-2xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 active:scale-95"
          aria-label="Toggle emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || sending}
            rows={1}
            maxLength={MAX_CHARS}
            className="w-full resize-none rounded-xl md:rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 md:py-2.5 pr-14 md:pr-16 text-sm md:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-sm disabled:opacity-50"
            aria-label="Message input"
          />
          <div className="absolute right-3 bottom-3 md:bottom-2.5">
            <span className={`text-[10px] leading-none font-medium ${body.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
              {body.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!body.trim() || disabled || sending}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-500 text-white transition-all duration-200 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
          aria-label="Send message"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
    </div>
  );
}
