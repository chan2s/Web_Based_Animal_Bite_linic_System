export default function OnlineStatus({ isOnline, lastSeen, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'w-2 h-2 md:w-2.5 md:h-2.5' : 'w-2.5 h-2.5 md:w-3 md:h-3';
  const textSize = size === 'sm' ? 'text-[11px] md:text-xs' : 'text-xs md:text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`relative inline-flex rounded-full ${sizeClasses} ${
          isOnline
            ? 'bg-emerald-500'
            : 'bg-gray-300'
        }`}
      >
        {isOnline && (
          <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-50" />
        )}
      </span>
      <span className={`${textSize} leading-none ${isOnline ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
        {isOnline ? 'Online' : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
      </span>
    </div>
  );
}
