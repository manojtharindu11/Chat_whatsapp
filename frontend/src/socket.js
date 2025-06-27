import { io } from "socket.io-client";

// Change this URL to your backend server address if needed
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5002";

const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually when needed
  transports: ["websocket"],
});

let mySocketId = null;

socket.on("connect", () => {
  mySocketId = socket.id;
  socket.emit("client_connected", { socketId: socket.id });
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export function getMySocketId() {
  return mySocketId;
}

export function sendMessageToUser(toSocketId, message) {
  socket.emit("send_message", {
    from: mySocketId,
    to: toSocketId,
    content: message,
    timestamp: new Date().toISOString(),
  });
}

export function onReceiveMessage(callback) {
  socket.on("receive_message", callback);
}

export function onConnect(callback) {
  socket.on("connect", callback);
}

export function onDisconnect(callback) {
  socket.on("disconnect", callback);
}

// Listen for connected clients updates
export function onConnectedClientsUpdate(callback) {
  socket.on("connected_clients", callback);
}

export default socket;
