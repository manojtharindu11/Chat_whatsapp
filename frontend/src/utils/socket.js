import { io } from "socket.io-client";

// Replace with your backend server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false, // Manual connect
  transports: ["websocket"], // optional: for pure websocket
});

export default socket;
