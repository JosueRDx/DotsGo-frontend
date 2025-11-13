import { io } from "socket.io-client";

import { API_URL } from "../../utils/constants";

// Configuración de reconexión mejorada
export const socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // Permitir fallback
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// Gestión de sesión persistente
const SESSION_STORAGE_KEY = 'dotsgo_session';
const GAME_DATA_KEY = 'dotsgo_game_data';
const ACTIVE_TAB_KEY = 'dotsgo_active_tab';

// Generar ID único para esta pestaña
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Guarda la sesión del jugador en localStorage
 */
export const saveSession = (sessionData) => {
  try {
    const sessionWithTab = {
      ...sessionData,
      timestamp: Date.now(),
      tabId: TAB_ID
    };
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionWithTab));
    
    // Marcar esta pestaña como activa
    localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
    
    console.log('✅ Sesión guardada:', sessionData);
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
};

/**
 * Recupera la sesión del jugador desde localStorage
 */
export const getSession = () => {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    
    // Verificar que la sesión no tenga más de 3 minutos
    const elapsed = Date.now() - session.timestamp;
    const THREE_MINUTES = 3 * 60 * 1000;
    
    if (elapsed > THREE_MINUTES) {
      console.log('⏰ Sesión expirada, eliminando...');
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error recuperando sesión:', error);
    return null;
  }
};

/**
 * Limpia la sesión del localStorage
 */
export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(GAME_DATA_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
    console.log('🗑️ Sesión limpiada');
  } catch (error) {
    console.error('Error limpiando sesión:', error);
  }
};

/**
 * Verifica si hay otra pestaña activa con sesión
 * @returns {boolean} True si hay otra pestaña activa
 */
export const hasActiveTabWithSession = () => {
  try {
    const session = getSession();
    if (!session) return false;
    
    const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
    
    // Si no hay pestaña activa marcada, esta es la primera
    if (!activeTabId) return false;
    
    // Si la pestaña activa es esta misma, no hay conflicto
    if (activeTabId === TAB_ID) return false;
    
    // Hay otra pestaña activa
    return true;
  } catch (error) {
    console.error('Error verificando pestaña activa:', error);
    return false;
  }
};

/**
 * Guarda datos del juego actual
 */
export const saveGameData = (gameData) => {
  try {
    sessionStorage.setItem(GAME_DATA_KEY, JSON.stringify(gameData));
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(gameData));
  } catch (error) {
    console.error('Error guardando datos del juego:', error);
  }
};

/**
 * Recupera datos del juego actual
 */
export const getGameData = () => {
  try {
    let dataStr = sessionStorage.getItem(GAME_DATA_KEY);
    if (!dataStr) {
      dataStr = localStorage.getItem(GAME_DATA_KEY);
    }
    return dataStr ? JSON.parse(dataStr) : null;
  } catch (error) {
    console.error('Error recuperando datos del juego:', error);
    return null;
  }
};

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log(`🔌 Intentando conectar socket a: ${API_URL}`);
  } else {
    console.log("✅ Socket ya estaba conectado");
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket desconectado");
  }
};

/**
 * Función para salir limpiamente de un juego
 * @param {string} pin - PIN del juego
 * @param {string} username - Nombre del usuario
 */
export const leaveGameCleanly = (pin, username) => {
  if (socket.connected && pin && username) {
    socket.emit("leave-game", { pin, username });
    console.log(`👋 Usuario ${username} salió limpiamente del juego ${pin}`);
  }
  // Limpiar sesión al salir voluntariamente
  clearSession();
};

/**
 * Intenta reconectar al jugador a un juego existente
 * @param {Object} callbacks - Callbacks para manejar eventos de reconexión
 */
export const attemptReconnection = (callbacks = {}) => {
  const session = getSession();
  
  if (!session || !session.sessionId || !session.pin) {
    console.log('❌ No hay sesión válida para reconectar');
    return false;
  }
  
  console.log('🔄 Intentando reconexión automática...', session);
  
  // Configurar listeners de reconexión
  socket.on('player-reconnected', (data) => {
    console.log('✅ Reconexión exitosa:', data);
    if (callbacks.onReconnected) {
      callbacks.onReconnected(data);
    }
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  });
  
  // Conectar socket si no está conectado
  if (!socket.connected) {
    connectSocket();
  }
  
  return true;
};

// Configurar reconexión automática al detectar reconexión del socket
socket.on('connect', () => {
  console.log('🔌 Socket conectado:', socket.id);
  
  const session = getSession();
  if (session && session.sessionId && session.pin) {
    console.log('🔄 Detectada sesión previa, intentando reconectar...');
    
    // Intentar unirse nuevamente con el sessionId
    socket.emit('join-game', {
      pin: session.pin,
      username: session.username,
      character: session.character,
      sessionId: session.sessionId
    }, (response) => {
      if (response.success && response.reconnected) {
        console.log('✅ Reconexión automática exitosa');
      } else if (!response.success) {
        console.log('❌ Reconexión fallida:', response.error);
        clearSession();
      }
    });
  }
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket desconectado:', reason);
  
  // No limpiar la sesión en desconexión, permitir reconexión
  if (reason === 'io server disconnect') {
    // El servidor forzó la desconexión, reconectar manualmente
    socket.connect();
  }
});

// Limpiar marca de pestaña activa al cerrar/recargar
window.addEventListener('beforeunload', () => {
  const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
  if (activeTabId === TAB_ID) {
    localStorage.removeItem(ACTIVE_TAB_KEY);
    console.log('🗑️ Marca de pestaña activa limpiada');
  }
});
