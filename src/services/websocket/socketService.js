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

// 🔑 SISTEMA HÍBRIDO: localStorage + Socket.ID
// localStorage: Compartido entre pestañas del mismo navegador
// Socket.ID: Único por pestaña, pero vinculado a la sesión del navegador

const SESSION_KEY = 'dotsgo_browser_session';
const GAME_DATA_KEY = 'dotsgo_game_data';

/**
 * Guarda la sesión del navegador (compartida entre pestañas)
 */
export const saveBrowserSession = (sessionData) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ...sessionData,
      timestamp: Date.now()
    }));
    console.log('✅ Sesión del navegador guardada:', sessionData);
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
};

/**
 * Recupera la sesión del navegador
 */
export const getBrowserSession = () => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    
    // Verificar que la sesión no tenga más de 3 minutos sin actividad
    const elapsed = Date.now() - session.timestamp;
    const THREE_MINUTES = 3 * 60 * 1000;
    
    if (elapsed > THREE_MINUTES) {
      console.log('⏰ Sesión expirada, eliminando...');
      clearBrowserSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error recuperando sesión:', error);
    return null;
  }
};

/**
 * Limpia la sesión del navegador
 */
export const clearBrowserSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(GAME_DATA_KEY);
    console.log('🗑️ Sesión del navegador limpiada');
  } catch (error) {
    console.error('Error limpiando sesión:', error);
  }
};

/**
 * Actualiza el timestamp de la sesión (mantenerla activa)
 */
export const updateSessionTimestamp = () => {
  const session = getBrowserSession();
  if (session) {
    saveBrowserSession(session);
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
  // Limpiar sesión del navegador
  clearBrowserSession();
};

// 🔑 Reconexión automática con sesión del navegador
socket.on('connect', () => {
  console.log('🔌 Socket conectado:', socket.id);
  
  // Verificar si hay sesión del navegador
  const browserSession = getBrowserSession();
  if (browserSession && browserSession.pin) {
    console.log('🔄 Sesión del navegador detectada, intentando reconectar...');
    console.log('   Usuario:', browserSession.username);
    console.log('   PIN:', browserSession.pin);
    
    // Intentar reconectar con la sesión del navegador
    socket.emit('join-game', {
      pin: browserSession.pin,
      username: browserSession.username,
      character: browserSession.character
    }, (response) => {
      if (response.success) {
        console.log('✅ Reconexión automática exitosa');
        updateSessionTimestamp();
        
        // Emitir evento para que la UI se actualice
        socket.emit('browser-session-restored', {
          username: browserSession.username,
          character: browserSession.character,
          gameStatus: response.gameStatus
        });
      } else {
        console.log('❌ Reconexión fallida:', response.error);
        if (response.error.includes('Ya existe un jugador')) {
          // Mantener la sesión, solo actualizar socket.id en backend
          console.log('⚠️ Jugador ya existe, manteniendo sesión');
        } else {
          clearBrowserSession();
        }
      }
    });
  }
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket desconectado:', reason);
  
  // NO limpiar sesión del navegador, permitir reconexión
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});
