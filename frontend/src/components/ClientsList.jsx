import React from "react";

const ClientsList = ({ clients }) => (
  <div
    className="clients-list"
    style={{
      marginBottom: 10,
      padding: 8,
      background: "#f5f5f5",
      borderRadius: 4,
    }}
  >
    <strong>Connected Clients:</strong>
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {clients.map((client) => (
        <li key={client.socketId || client}>{client.socketId || client}</li>
      ))}
    </ul>
  </div>
);

export default ClientsList;
