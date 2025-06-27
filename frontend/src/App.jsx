import { useState } from "react";
import Chat from "./components/chat";
import "./App.css";

function App() {

  return (
    <>
      <div className="app">
        <h2 className="app-header">Chat</h2>
        <Chat />
      </div>
    </>
  );
}

export default App;
