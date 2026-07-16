export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
      </div>
      <span className="text-xs md:text-sm">
        {name || 'Someone'} <span className="text-gray-400">is typing...</span>
      </span>
    </div>
  );
}
