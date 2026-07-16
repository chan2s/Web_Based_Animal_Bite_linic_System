import { CheckCheck, Check } from 'lucide-react';

export default function MessageBubble({ message, isOwn, showTimestamp = true }) {
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusIcon = () => {
    if (isOwn) {
      if (message.is_read) {
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
      }
      if (message.is_delivered) {
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      }
      return <Check className="w-3.5 h-3.5 text-gray-400" />;
    }
    return null;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 md:mb-3 animate-[slide-up_0.2s_ease-out]`}>
      <div
        className={`
          max-w-[85%] md:max-w-[75%] lg:max-w-[70%]
          rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3
          shadow-sm
          ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
          }
        `}
      >
        <p className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.body}
        </p>
        {showTimestamp && (
          <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] md:text-[11px] leading-none ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
              {time}
            </span>
            {isOwn && (
              <span className="flex-shrink-0">
                {getStatusIcon()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
