import { useState, useEffect } from 'react';
import { socket } from '../services/websocket/socketService';

/**
 * Hook personalizado para manejar reconexión automática
 * 🔑 Ahora basado en socket.id - Socket.io maneja la reconexión automáticamente
 */
export const useReconnection = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState(180);

  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Socket conectado:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);
    };

    const handleDisconnect = (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      setIsConnected(false);
      
      // Solo intentar reconectar si no fue desconexión voluntaria
      if (reason !== 'io client disconnect') {
        setIsReconnecting(true);
      }
    };

    const handleReconnectAttempt = (attemptNumber) => {
      console.log(`🔄 Intento de reconexión #${attemptNumber}`);
      setIsReconnecting(true);
    };

    const handleReconnectError = (error) => {
      console.error('❌ Error de reconexión:', error);
    };

    const handleReconnectFailed = () => {
      console.error('❌ Reconexión fallida después de todos los intentos');
      setIsReconnecting(false);
    };

    const handlePlayerDisconnected = (data) => {
      console.log('👤 Jugador desconectado:', data);
      if (data.gracePeriodSeconds) {
        setGracePeriodSeconds(data.gracePeriodSeconds);
      }
    };

    const handlePlayerReconnected = (data) => {
      console.log('✅ Jugador reconectado:', data);
      setIsConnected(true);
      setIsReconnecting(false);
    };

    const handlePlayerRemoved = (data) => {
      if (data.reason === 'reconnection_timeout') {
        console.log('⏰ Eliminado por timeout de reconexión');
        // Redirigir al home
        window.location.href = '/';
      }
    };

    // Registrar listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);
    socket.on('player-disconnected', handlePlayerDisconnected);
    socket.on('player-reconnected', handlePlayerReconnected);
    socket.on('player-removed', handlePlayerRemoved);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('player-disconnected', handlePlayerDisconnected);
      socket.off('player-reconnected', handlePlayerReconnected);
      socket.off('player-removed', handlePlayerRemoved);
    };
  }, []);

  // 🔑 Ya no necesitamos reconexión manual
  // Socket.io maneja todo automáticamente con socket.id

  return {
    isConnected,
    isReconnecting,
    gracePeriodSeconds
  };
};
