import React, { useState, useEffect } from "react";
import Message from "./Message";
import ClientsList from "./ClientsList";
import {
  connectSocket,
  disconnectSocket,
  onReceiveMessage,
  sendMessageToUser,
} from "../socket";
import socket from "../socket";

const Chat = () => {
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
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
      roomId,
    };
    setMessages([...messages, message]);
    sendMessageToUser(message);
    setInput("");
  };

  useEffect(() => {
    if (!roomId) return;
    connectSocket();
    // Join the room after connecting
    socket.emit("join_room", roomId);
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
    });
    onReceiveMessage((message) => {
      if (message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });
    socket.on("connected_clients", (clientList) => {
      setClients(clientList);
    });
    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  if (!roomId) {
    return (
      <div
        className="room-id-container"
        style={{
          padding: 32,
          textAlign: "center",
        }}
      >
        <h2>Enter Room ID to Join</h2>
        <input
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          placeholder="Room ID"
          style={{
            padding: 8,
            fontSize: 16,
            marginRight: 8,
          }}
        />
        <button
          onClick={() => {
            if (roomInput.trim()) setRoomId(roomInput.trim());
          }}
          style={{
            padding: 8,
            fontSize: 16,
          }}
        >
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div
        style={{
          padding: 8,
          background: "#f0f0f0",
          borderRadius: 4,
          marginBottom: 10,
        }}
      >
        <strong>Room ID:</strong> {roomId}
      </div>
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
