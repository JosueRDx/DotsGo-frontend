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
