import { useCallback, useRef } from 'react';

interface WebSocketHook {
  connect: (url: string, token: string) => void;
  disconnect: () => void;
  send: (data: unknown) => void;
}

export function useWebSocket(): WebSocketHook {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((url: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${url}?token=${token}`);

    ws.onopen = () => {
      console.log('[WS] Connected');
    };

    ws.onclose = (event) => {
      console.log('[WS] Disconnected:', event.code);
    };

    ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connect, disconnect, send };
}
