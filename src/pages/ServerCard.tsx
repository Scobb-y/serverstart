import "./ServerCard.css";

interface ServerCardProps {
  name: string;
  status: "online" | "offline";
  players: number;
  ram: number;
}

export default function ServerCard({
  name,
  status,
  players,
  ram,
}: ServerCardProps) {
  return (
    <div className={`server-card ${status}`}>
      <div className="server-header">
        <h3>{name}</h3>
        <span className="status-dot"></span>
      </div>

      <div className="server-stats">
        <p><strong>Players:</strong> {players}</p>
        <p><strong>RAM:</strong> {ram} GB</p>
      </div>

      <div className="server-actions">
        <button>Start</button>
        <button>Stop</button>
        <button>Restart</button>
      </div>
    </div>
  );
}
