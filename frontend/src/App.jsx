import { useState } from "react";
import Chat from "./chat";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="app">
        <h2 className="app-header">WhatsApp Chat Sim</h2>
        <Chat />
      </div>
    </>
  );
}

export default App;
