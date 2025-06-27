import React, { useState, useEffect } from "react";
import Message from "./Message";
import {
  connectSocket,
  disconnectSocket,
  onConnect,
  onConnectedClients,
  onReceiveMessage,
  sendMessageToUser,
} from "../utils/socket";
import socket from "../utils/socket";
import ClientsList from "./ClientsList";

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there!", sender: "other" },
    { text: "Hello! How are you?", sender: "me" },
  ]);
  const [input, setInput] = useState("");
  const [clients, setClients] = useState([]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    const message = {
      text: input,
      sender: "me",
    };
    setMessages([...messages, message]);
    sendMessageToUser(11,message);
    setInput("");
  };

  useEffect(() => {
    connectSocket();
    onConnect(() => {
      console.log("Connected with socket ID:", socket.id);
    });
    onReceiveMessage((message) => {
      if (message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });
    onConnectedClients((clientList) => {
      console.log("Connected clients:", clientList);
      setClients(clientList);
    });
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className="chat-container">
      <div
        style={{
          padding: 8,
          background: "#f0f0f0",
          borderRadius: 4,
          marginBottom: 10,
        }}
      ></div>
      <ClientsList clients={clients} />
      <div className="messages">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
