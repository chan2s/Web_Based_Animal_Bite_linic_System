import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { showSuccess } from '../hooks/useToast';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });
  const [showBanner, setShowBanner] = useState(false);

  // ── Listen for browser online / offline events ──
  useEffect(() => {
    if (typeof window === 'undefined' || !('onLine' in navigator)) return;

    // Show banner immediately if we start offline
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    function handleOnline() {
      setIsOnline(true);
      setShowBanner(false);

      // Show a success toast when connection is restored
      showSuccess('✅ Internet connection restored.');
    }

    function handleOffline() {
      setIsOnline(false);
      setShowBanner(true);
    }

    window.addEventListener('online', handleOnline, { passive: true });
    window.addEventListener('offline', handleOffline, { passive: true });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── Expose a retry helper so pages can re-check connectivity ──
  const retry = useCallback(() => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);
    if (online) {
      setShowBanner(false);
    }
    return online;
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        retry,
        showBanner,
        dismissBanner,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

/**
 * useNetworkStatus – the primary consumer hook.
 *
 * Every component across the app can call this to read the current
 * online/offline state without prop-drilling.
 */
export function useNetworkStatus() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a <NetworkProvider>');
  }
  return context;
}

export default NetworkContext;
