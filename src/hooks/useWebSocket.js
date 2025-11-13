import { useEffect, useCallback, useRef, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/websocket/socketService';

export const useWebSocket = (options = {}) => {
  const { autoConnect = false } = options;
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    try {
      connectSocket();
    } catch (err) {
      setError(err);
      console.error('Error connecting socket:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      disconnectSocket();
    } catch (err) {
      setError(err);
      console.error('Error disconnecting socket:', err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleConnect = () => {
      if (mountedRef.current) {
        setIsConnected(true);
        setError(null);
      }
    };

    const handleDisconnect = () => {
      if (mountedRef.current) {
        setIsConnected(false);
      }
    };

    const handleError = (err) => {
      if (mountedRef.current) {
        setError(err);
        console.error('Socket error:', err);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    if (autoConnect && !socket.connected) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, [autoConnect, connect]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect
  };
};

export default useWebSocket;
