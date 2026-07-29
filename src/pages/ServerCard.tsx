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
  function startServer() {
    fetch(`http://localhost:3000/api/servers/${serverName}/start`, {
      method: "POST"
    });
  }

  function stopServer() {
    fetch(`http://localhost:3000/api/servers/${serverName}/stop`, {
      method: "POST"
    });
  }

  const navigate = useNavigate();
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
