import { io } from "socket.io-client";

const socket = io("http://localhost:5002");

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.off("receive_message");
    socket.off("connected_clients");
    socket.emit("disconnect"); // Notify server before disconnecting
    socket.disconnect();
  }
}

export function sendMessage(message) {
  socket.emit("send_message", {
    content: message,
    timestamp: new Date().toISOString(),
  });
}

export function onReceiveMessage(callback) {
  socket.on("receive_message", callback);
}

export function onConnectedClients(callback) {
  socket.on("connected_clients", callback);
}

export default socket;
