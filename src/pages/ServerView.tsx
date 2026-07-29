import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

interface ServerViewData {
  name: string;
  status: "online" | "offline";
  jarArgs: string;
  players: number;
  ram: number;
  logs: string;
}

export default function ServerView() {
  const { id } = useParams();
  const [server, setServer] = useState<ServerViewData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/servers/${id}`)
      .then(res => res.json())
      .then(setServer);
  }, [id]);

  if (!server) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className={`profile-details ${server.status}`}>
        <div className="server-header">
          <h3>{server.name}</h3>
          <span className="status-dot"></span>
        </div>
      </div>

      <div className="server-stats">
        <p><strong>Players:</strong> {server.players}</p>
        <p><strong>RAM:</strong> {server.ram} GB</p>
      </div>

      <div className="server-details">
        <p><strong>Java Args:</strong> {server.jarArgs}</p>
      </div>
    </DashboardLayout>
  );
}
