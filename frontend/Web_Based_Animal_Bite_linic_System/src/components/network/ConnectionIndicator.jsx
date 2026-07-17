import { motion } from 'framer-motion';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionIndicator() {
  const { isOnline } = useNetworkStatus();

  return (
    <motion.div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white/80"
      style={{
        borderColor: isOnline ? '#d1fae5' : '#fee2e2',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className="w-2 h-2 rounded-full shadow-sm"
        style={{
          backgroundColor: isOnline ? '#10b981' : '#ef4444',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: isOnline ? Infinity : 0, repeatDelay: 3 }}
      />
      <span className="text-[11px] font-medium" style={{ color: isOnline ? '#6b7280' : '#ef4444' }}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {isOnline ? (
        <Wifi className="w-3 h-3 text-emerald-400" />
      ) : (
        <WifiOff className="w-3 h-3 text-red-400" />
      )}
    </motion.div>
  );
}
