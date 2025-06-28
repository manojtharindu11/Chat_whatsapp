import React from "react";

const getClientLabel = (client) => {
  return client.socketId || client;
};

const ClientsList = ({ clients, selected, onSelect }) => (
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
    <select
      style={{ width: "100%", padding: 6, marginTop: 6 }}
      value={selected || ""}
      onChange={(e) =>
        onSelect &&
        onSelect(clients.find((c) => (c.socketId || c) === e.target.value))
      }
    >
      <option value="" disabled>
        -- Select a client --
      </option>
      {clients.map((client) => (
        <option
          key={client.socketId || client}
          value={client.socketId || client}
        >
          {getClientLabel(client)}
        </option>
      ))}
    </select>
  </div>
);

export default ClientsList;
