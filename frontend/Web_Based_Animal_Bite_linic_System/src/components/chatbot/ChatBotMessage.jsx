import { Bot, User } from 'lucide-react';

// ─── Text Formatting ──────────────────────────────────────────────────────

function formatText(text) {
  if (!text) return '';

  let html = text
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic: *text*
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-pink-600">$1</code>')
    // Clickable links
    .replace(
      /https?:\/\/[^\s<]+/g,
      '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$&</a>'
    )
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
}

// ─── Time Formatting ───────────────────────────────────────────────────────

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return time;

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} ${time}`;
}

// ─── Message Component ─────────────────────────────────────────────────────

export default function ChatBotMessage({ message }) {
  const isUser = message.role === 'user';
  const time = formatTime(message.created_at);

  return (
    <div className={`flex items-end gap-2.5 px-5 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
          ${isUser
            ? 'bg-blue-600 shadow-sm shadow-blue-200'
            : 'bg-blue-50 border border-blue-100'
          }
        `}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-blue-500" />
        )}
      </div>

      {/* Bubble + Timestamp */}
      <div className={`max-w-[82%] ${isUser ? 'text-right' : ''}`}>
        {/* Bubble */}
        <div
          className={`
            inline-block rounded-2xl px-4 py-2.5
            ${isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md shadow-sm shadow-blue-200/30'
              : 'bg-white text-gray-800 rounded-tl-md border border-gray-100 shadow-sm'
            }
          `}
        >
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap break-words [&_strong]:font-semibold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
          />
        </div>

        {/* Timestamp */}
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'} px-0.5`}>
          <span className="text-[10px] text-gray-400 font-medium tracking-tight">{time}</span>
        </div>
      </div>
    </div>
  );
}
