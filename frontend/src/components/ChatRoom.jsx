import React, { useState, useEffect, useRef } from "react";
import ClientsList from "./ClientsList";
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
  const [selectedClientId, setSelectedClientId] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [myId, setMyId] = useState(null);
  const myIdRef = useRef(null);

  useEffect(() => {
    connectSocket();
    onConnect(() => {
      setMyId(getMySocketId());
      myIdRef.current = getMySocketId();
    });
    onConnectedClientsUpdate((clients) => {
      console.log("Connected clients updated:", clients);
      setConnectedClients(clients);
      // If selected client is not in the new list, clear selection
      if (
        selectedClientId &&
        !clients.some((c) => c.socketId === selectedClientId)
      ) {
        setSelectedClientId("");
      }
    });
    // Only add the receive handler once
    const receiveHandler = (data) => {
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
    };
    onReceiveMessage(receiveHandler);
    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedClientId || !message.trim() || !myId) return;
    sendMessageToUser(selectedClientId, message.trim());
    setMessage("");
  };

  // Filter out self from connectedClients for display
  const filteredClients = connectedClients.filter(
    (client) => client.socketId !== myId
  );
  const selectedClient = connectedClients.find(
    (c) => c.socketId === selectedClientId
  );

  // Show all messages between me and selected client
  const visibleMessages = chatMessages.filter(
    (msg) =>
      (msg.from === myId && msg.to === selectedClientId) ||
      (msg.from === selectedClientId && msg.to === myId)
  );

  return (
    <div className="chat-room">
      <ClientsList
        clients={filteredClients}
        selected={selectedClientId}
        onSelect={(client) => setSelectedClientId(client?.socketId || "")}
      />
      <div className="chat-area">
        {selectedClient ? (
          <>
            <h3>Chat with: {selectedClient.name || selectedClient.socketId}</h3>
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
