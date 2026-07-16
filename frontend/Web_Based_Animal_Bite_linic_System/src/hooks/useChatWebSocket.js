import { useRef, useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];
const PING_INTERVAL = 25000;

export default function useChatWebSocket(onMessage, onOpen, onClose) {
  const { token } = useAuth();
  const wsRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Use refs for callbacks to prevent reconnect storms on re-render
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  // Keep refs updated
  onMessageRef.current = onMessage;
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;

  const connect = useCallback(() => {
    if (!token || !mountedRef.current) return;

    setConnectionStatus('connecting');

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost:8000'
      : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/?token=${token}`;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      reconnectAttemptRef.current = 0;
      setConnectionStatus('connected');

      // Start ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL);

      if (onOpenRef.current) onOpenRef.current();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessageRef.current) onMessageRef.current(data);
      } catch (e) {
        // Ignore parsing errors
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      if (onCloseRef.current) onCloseRef.current();

      // Auto-reconnect if component is still mounted
      if (mountedRef.current) {
        const delay = RECONNECT_DELAYS[reconnectAttemptRef.current] || RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1];
        reconnectAttemptRef.current = Math.min(reconnectAttemptRef.current + 1, RECONNECT_DELAYS.length - 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, delay);
      }
    };

    ws.onerror = () => {
      // Error triggers onclose, so we just let onclose handle reconnection
    };
  }, [token]); // Only depend on token; callbacks via refs

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn(
      '[ChatWebSocket] sendMessage blocked: WebSocket not OPEN.',
      'readyState:', wsRef.current?.readyState,
      'status:', connectionStatus,
    );
    return false;
  }, [connectionStatus]);

  useEffect(() => {
    mountedRef.current = true;

    // Use setTimeout(0) to defer connect. This avoids the React StrictMode
    // double-mount issue where the cleanup closes the WebSocket before
    // the handshake completes, producing the misleading console error:
    //   "WebSocket is closed before the connection is established."
    // With deferral, the first mount's timeout is cleared by cleanup,
    // so only the second (real) mount actually opens a WebSocket.
    const connectTimer = setTimeout(() => {
      connect();
    }, 0);

    return () => {
      mountedRef.current = false;
      clearTimeout(connectTimer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    sendMessage,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
}
