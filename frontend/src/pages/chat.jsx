import React, { useEffect, useState } from "react";
import socket from "../utils/socket";

const initialChatMessages = {};

function Chat() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState();
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [inputValue, setInputValue] = useState("");

  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+94");
  const [countryCodes, setCountryCodes] = useState([]);
  const [connectionError, setConnectionError] = useState(false);

  const styles = {
    container: {
      fontFamily: "sans-serif",
      padding: 16,
      maxWidth: 600,
      margin: "0 auto",
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
    flex: { display: "flex" },
    sidebar: {
      width: 160,
      marginRight: 24,
      borderRight: "1px solid #ddd",
      paddingRight: 16,
    },
    sidebarTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    client: (active) => ({
      padding: "6px 8px",
      borderRadius: 4,
      cursor: "pointer",
      marginBottom: 4,
      background: active ? "#e0e7ff" : "transparent",
      fontWeight: active ? "bold" : "normal",
      border: active ? "1px solid #3b82f6" : "1px solid transparent",
      display: "flex",
      alignItems: "center",
    }),
    avatar: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "#bbb",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      marginRight: 8,
      fontSize: 15,
      flexShrink: 0,
    },
    chatArea: { flex: 1, paddingLeft: 16 },
    chatHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: 12,
      borderBottom: "1px solid #eee",
      paddingBottom: 8,
    },
    chatHeaderName: { fontWeight: "bold", fontSize: 18 },
    messagesBox: {
      marginBottom: 16,
      maxHeight: 260,
      overflowY: "auto",
      border: "1px solid #eee",
      borderRadius: 4,
      padding: 8,
      background: "#fafbfc",
    },
    message: (fromMe) => ({
      marginBottom: 4,
      textAlign: fromMe ? "right" : "left",
      borderBottom: "1px solid #eee",
      paddingBottom: 4,
      wordBreak: "break-word",
    }),
    from: { fontWeight: "600" },
    form: {
      display: "flex",
      gap: 8,
      marginTop: 16,
      borderTop: "1px solid #ddd",
      paddingTop: 12,
    },
    input: {
      flex: 1,
      border: "1px solid #ccc",
      borderRadius: 4,
      padding: "4px 8px",
    },
    button: {
      background: "#3b82f6",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      padding: "4px 16px",
      cursor: "pointer",
    },
  };

  useEffect(() => {
    fetchClients();
    fetchCountryCodes();
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      setConnectionError(false);
      console.log("connected", socket.id);
    });
    socket.on("disconnect", () => {
      setConnectionError(true);
    });
    socket.on("connect_error", () => {
      setConnectionError(true);
    });
    socket.on("receive_message", handleReceivedMessages);
    socket.on("send_message_response", (data) =>
      console.log("message sent response", data)
    );
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("receive_message");
      socket.off("send_message_response");
      socket.disconnect();
    };
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/clients");
      const data = await res.json();
      setClients(data.clients || []);
      setSelectedClient(data.clients?.[0]?.id);
    } catch {
      setClients([]);
      setSelectedClient(undefined);
    }
  };

  const fetchCountryCodes = async () => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/codes"
      );
      const data = await res.json();
      const codes = data.data
        .map((c) => ({
          name: c.name,
          code: c.dial_code?.startsWith("+") ? c.dial_code : `+${c.dial_code}`,
        }))
        .filter((c) => c.code)
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountryCodes(codes);
    } catch (e) {
      console.error("Failed to fetch country codes:", e);
    }
  };

  const handleReceivedMessages = (data) => {
    if (data?.from?.id && data.content) {
      setChatMessages((prev) => ({
        ...prev,
        [data.from.id]: [
          ...(prev[data.from.id] || []),
          { from: data.from.name, text: data.content },
        ],
      }));
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (!message) return;
    socket.emit("send_message", {
      from: "Me",
      content: message,
      to: selectedClient,
      timestamp: new Date().toISOString(),
    });
    setChatMessages((prev) => ({
      ...prev,
      [selectedClient]: [
        ...(prev[selectedClient] || []),
        { from: "Me", text: message },
      ],
    }));
    setInputValue("");
  };

  const handleNewChatSubmit = async () => {
    if (!newName || !newPhone) {
      return alert("Please fill in both name and phone number.");
    }

    // Validate phone number: must be digits only and between 6 to 15 digits
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(newPhone)) {
      return alert(
        "Invalid phone number. Only digits allowed, between 6 to 15 characters."
      );
    }

    const fullNumber = selectedCountryCode.replace("+", "") + newPhone;

    try {
      await fetch(import.meta.env.VITE_API_URL + "/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, whatsapp: fullNumber }),
      });
      alert(
        "Please reply to message received as 'Hello, this is ur order' to start the chat. Otherwise this won't work."
      );
      setNewName("");
      setNewPhone("");
      setShowNewChatForm(false);
      fetchClients();
    } catch (e) {
      alert("Failed to add new chat");
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  const selectedClientObj = clients.find((c) => c.id === selectedClient);

  return (
    <div style={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={styles.title}>Chat-Whatsapp</h1>
        <button style={styles.button} onClick={() => setShowNewChatForm(true)}>
          ➕ New Chat
        </button>
      </div>

      {showNewChatForm && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: "#f9f9f9",
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Add New Chat</h3>
          <input
            style={{ ...styles.input, marginBottom: 8 }}
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              style={{ ...styles.input, width: "100%" }}
            >
              {countryCodes.map((c, index) => (
                <option key={index} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <input
              placeholder="Whatsapp Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.button} onClick={handleNewChatSubmit}>
              Submit
            </button>
            <button
              onClick={() => setShowNewChatForm(false)}
              style={{ ...styles.button, background: "#aaa" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.flex}>
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>All Chats</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {clients.map((client) => (
              <li
                key={client.id}
                style={styles.client(selectedClient === client.id)}
                onClick={() => setSelectedClient(client.id)}
              >
                <span style={styles.avatar}>{getInitials(client.name)}</span>
                {client.name}
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.chatArea}>
          <div style={styles.chatHeader}>
            <span style={styles.avatar}>
              {getInitials(selectedClientObj?.name)}
            </span>
            <span style={styles.chatHeaderName}>{selectedClientObj?.name}</span>
          </div>
          <div style={styles.messagesBox}>
            {(chatMessages[selectedClient] || []).map((msg, idx) => (
              <div key={idx} style={styles.message(msg.from === "Me")}>
                <span style={styles.from}>{msg.from}:</span> {msg.text}
              </div>
            ))}
          </div>
          <form style={styles.form} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              style={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" style={styles.button}>
              Send
            </button>
          </form>
        </div>
      </div>
      {/* Connection error message at the bottom */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        {connectionError && (
          <span
            style={{
              color: "#b91c1c",
              background: "#fef2f2",
              fontSize: 13,
              padding: 6,
              borderRadius: 4,
              margin: 8,
              display: "inline-block",
            }}
          >
            Connection lost. The backend may be unavailable (token expired or
            free hosting limit exceeded).
          </span>
        )}
      </div>
    </div>
  );
}

export default Chat;
