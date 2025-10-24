import { io } from "socket.io-client";

import { API_URL } from "../../utils/constants";

export const socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket"], // Forzar WebSocket
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log(`Intentando conectar socket a: ${API_URL}`);
  } else {
    console.log("Socket ya estaba conectado");
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket desconectado");
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
    console.log(`Usuario ${username} salió limpiamente del juego ${pin}`);
  }
};
