import { useState, useEffect, useCallback } from 'react';

/**
 * useNetworkStatus
 *
 * A low-level hook that tracks navigator.onLine via the 'online' / 'offline'
 * window events.  Returns the raw isOnline flag plus a retry() helper.
 *
 * Most components should prefer the higher-level useNetworkStatus() from
 * NetworkContext, which also exposes showBanner / retry / offline detection.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Defensive: navigator.onLine is undefined in some SSR/headless envs
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    // If the browser doesn't support the API, bail out
    if (typeof window === 'undefined' || !('onLine' in navigator)) return;

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline, { passive: true });
    window.addEventListener('offline', handleOffline, { passive: true });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /** Force a re-check of the current connection state */
  const retry = useCallback(() => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);
    return online;
  }, []);

  return { isOnline, retry };
}

export default useNetworkStatus;
