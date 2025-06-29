import React, { useState, useEffect } from "react";
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
  onReceiveMessage,
  onConnectedClients,
} from "./chat";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Setup logic
    connectSocket();
    onConnectedClients((clients) => {
      console.log("Connected clients:", clients);
    });
    onReceiveMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup logic
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setMessages((prev) => [
      ...prev,
      {
        content: input.trim(),
        self: true,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="app">
      <h2 className="app-header">Chat</h2>
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message${msg.self ? " me" : " other"}`}
            style={{ marginBottom: 8 }}
          >
            <span>{msg.content}</span>
            <div style={{ fontSize: 10, color: "#888" }}>
              {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form className="input-area" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
