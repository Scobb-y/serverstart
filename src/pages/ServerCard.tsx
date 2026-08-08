import { useNavigate } from "react-router-dom";
import "./ServerCard.css";

interface ServerCardProps {
  name: string;
  status: "online" | "offline";
  players: number;
  ram: number;
}


export default function ServerCard({
  name: serverName,
  status,
  players,
  ram,
}: ServerCardProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  function startServer() {
    fetch(`${API_URL}/api/servers/${serverName}/start`, {
      method: "POST"
    });
  }

  function stopServer() {
    fetch(`${API_URL}/api/servers/${serverName}/stop`, {
      method: "POST"
    });
  }

  return (
    <div className={`server-card ${status}`}
      onClick={() => navigate(`/server/${serverName}`)}
      style={{cursor: "pointer"}}
    >

      <div className="server-header">
        <h3>{serverName}</h3>
        <span className="status-dot"></span>
      </div>

      <div className="server-stats">
        <p><strong>Players:</strong> {players}</p>
        <p><strong>RAM:</strong> {ram} GB</p>
      </div>

      <div className="server-actions">
        <button onClick={(e) => {
          e.stopPropagation();
          startServer();
        }}>Start</button>

        <button onClick={(e) => {
          e.stopPropagation();
          stopServer();
        }}>Stop</button>
        
        <button>Restart</button>
      </div>
    </div>
  );
}
