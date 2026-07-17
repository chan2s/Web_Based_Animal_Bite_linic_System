import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import { WifiOff, RefreshCw, X } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline, showBanner, retry, dismissBanner } = useNetworkStatus();

  return (
    <AnimatePresence>
      {showBanner && !isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium truncate">
                You're offline. Some features may not be available.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={retry}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors"
                aria-label="Retry connection"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <button
                onClick={dismissBanner}
                className="p-1 rounded-md hover:bg-white/20 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
