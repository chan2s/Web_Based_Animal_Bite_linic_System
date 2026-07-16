export default function UnreadBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[20px] md:min-w-[22px] h-5 md:h-[22px] px-1.5 rounded-full bg-blue-500 text-white text-[10px] md:text-xs font-bold leading-none shadow-sm animate-[badgePop_0.3s_ease-out]">
      {count > 99 ? '99+' : count}
    </span>
  );
}
