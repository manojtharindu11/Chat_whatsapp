import React, { useState, useEffect, useRef } from "react";
import {
  connectSocket,
  disconnectSocket,
  sendMessageToUser,
  onReceiveMessage,
  onConnectedClientsUpdate,
  getMySocketId,
  onConnect,
} from "../socket";

export default function ChatRoom() {
  const [connectedClients, setConnectedClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [myId, setMyId] = useState(null);
  const myIdRef = useRef(null);

  useEffect(() => {
    connectSocket();

    // Update myId on every socket connect event
    onConnect(() => {
      setMyId(getMySocketId());
      myIdRef.current = getMySocketId();
    });

    // Listen for connected clients updates
    onConnectedClientsUpdate((clients) => {
      setConnectedClients(clients);
    });

    // Listen for incoming messages
    onReceiveMessage((data) => {
      console.log("Received message:", data, "My ID:", myIdRef.current);
      setChatMessages((prev) => [
        ...prev,
        {
          content: data.content,
          from: data.from,
          to: data.to,
          timestamp: data.timestamp,
          isReceived: data.from !== myIdRef.current,
        },
      ]);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedClient || !message.trim() || !myId) return;
    console.log("Sending message:", {
      from: myId,
      to: selectedClient.socketId,
      content: message,
      timestamp: new Date().toISOString(),
    });
    sendMessageToUser(selectedClient.socketId, message.trim());
    // Do not add the message locally; rely on backend echo for both sender and receiver
    setMessage("");
  };

  // Filter out self from connectedClients for display
  const filteredClients = connectedClients.filter(
    (client) => client.socketId !== myId
  );

  // Helper: show all messages between me and selected client
  const visibleMessages = chatMessages.filter(
    (msg) =>
      (msg.from === myId && msg.to === selectedClient?.socketId) ||
      (msg.from === selectedClient?.socketId && msg.to === myId)
  );

  return (
    <div className="chat-room">
      <div className="connected-clients">
        <h3>Online Users</h3>
        <div style={{ fontSize: "0.9em", marginBottom: 10 }}>
          <b>Your Socket ID:</b>
          <div style={{ wordBreak: "break-all" }}>{myId || "..."}</div>
        </div>
        <ul>
          {filteredClients.length === 0 ? (
            <li>No other users online</li>
          ) : (
            filteredClients.map((client) => (
              <li
                key={client.socketId}
                className={
                  selectedClient?.socketId === client.socketId ? "selected" : ""
                }
                onClick={() => setSelectedClient(client)}
              >
                User: {client.socketId}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="chat-area">
        {selectedClient ? (
          <>
            <h3>Chat with: {selectedClient.socketId}</h3>
            <div className="messages">
              {visibleMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.from === myId ? "sent" : "received"
                  }`}
                >
                  <p>{msg.content}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}
