import { useState, useRef, useCallback, forwardRef } from 'react';
import { SendHorizonal } from 'lucide-react';

const ChatBotInput = forwardRef(function ChatBotInput({ onSend, disabled }, ref) {
  const [body, setBody] = useState('');
  const innerRef = useRef(null);
  const inputRef = ref || innerRef;

  const handleSend = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setBody('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [body, disabled, onSend, inputRef]);

  const handleChange = useCallback((e) => {
    setBody(e.target.value);
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  }, [inputRef]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const isEmpty = !body.trim();

  return (
    <div className="px-4 py-3 bg-white">
      <div className="flex items-end gap-2">
        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={disabled}
            rows={1}
            className="
              w-full resize-none
              rounded-xl
              border border-gray-200
              bg-gray-50
              px-4 py-2.5 pr-11
              text-sm text-gray-900
              placeholder-gray-400
              outline-none
              transition-all duration-200
              focus:border-blue-400
              focus:bg-white
              focus:ring-2 focus:ring-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed
              leading-relaxed
              max-h-[100px]
            "
            aria-label="Ask a question"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isEmpty || disabled}
          className="
            flex-shrink-0
            flex items-center justify-center
            w-[42px] h-[42px]
            rounded-xl
            bg-gradient-to-br from-blue-600 to-blue-700
            text-white
            transition-all duration-200
            hover:from-blue-700 hover:to-blue-800
            hover:shadow-md hover:shadow-blue-500/20
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
          "
          aria-label="Send message"
        >
          <SendHorizonal className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
});

export default ChatBotInput;
