import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL || '/';

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"], // Forzar WebSocket
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log(`Intentando conectar socket a: ${URL}`);
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
