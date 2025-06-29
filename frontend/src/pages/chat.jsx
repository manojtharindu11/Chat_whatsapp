import React, { useState } from "react";

const clients = [
  { id: 1, name: "User 1" },
  { id: 2, name: "User 2" },
  { id: 3, name: "User 3" },
];

const chatMessages = {
  1: [
    { from: "User 1", text: "Hello!" },
    { from: "Me", text: "Hi User 1!" },
  ],
  2: [
    { from: "User 2", text: "Hi there!" },
    { from: "Me", text: "Hello User 2!" },
  ],
  3: [
    { from: "User 3", text: "Hey!" },
    { from: "Me", text: "Hi User 3!" },
  ],
};

function Chat() {
  const [selectedClient, setSelectedClient] = useState(clients[0].id);

  // Inline styles for minimal readability
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
    message: (fromMe) => ({
      marginBottom: 4,
      textAlign: fromMe ? "right" : "left",
      borderBottom: "1px solid #eee",
      paddingBottom: 4,
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

  // Helper to get client info
  const selectedClientObj = clients.find((c) => c.id === selectedClient);
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Chat-Whatsapp</h1>
      <div style={styles.flex}>
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Online Clients</h2>
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
              {getInitials(selectedClientObj.name)}
            </span>
            <span style={styles.chatHeaderName}>{selectedClientObj.name}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            {chatMessages[selectedClient].map((msg, idx) => (
              <div key={idx} style={styles.message(msg.from === "Me")}>
                <span style={styles.from}>{msg.from}:</span> {msg.text}
              </div>
            ))}
          </div>
          <form style={styles.form}>
            <input
              type="text"
              placeholder="Type a message..."
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
