import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import "./ServerView.css";

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
  const [javaArgs, setJavaArgs] = useState(server?.jarArgs);


  useEffect(() => {
    fetch(`http://localhost:3000/api/servers/${id}`)
      .then(res => res.json())
      .then(setServer);
  }, [id]);

  async function applyJavaArgs() {
    await fetch(`http://localhost:3000/api/servers/${id}/java-args`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ java_args: javaArgs })
    });

    const res = await fetch(`http://localhost:3000/api/servers/${id}`);
    const updated = await res.json();
    setServer(updated);
  }

  if (!server) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="serverview-container">        
        <div className={`server-info ${server.status}`}>
          <div className="server-header">
            <h3>{server.name}</h3>
            <span className="status-dot"></span>
          </div>

          <div className="server-stats">
            <p><strong>Players:</strong> {server.players}</p>
            <p><strong>RAM:</strong> {server.ram} GB</p>
          </div>

          <div className="server-details">
            <p><strong>Java Args:</strong></p>
            <input
              className="inputArgs"
              value={server.jarArgs}
              onChange={e => setJavaArgs(e.target.value)}
              placeholder="Put java args here..."
            />
            <button className="button" onClick={applyJavaArgs}>
              Apply
            </button>

          </div>
        </div>

        <div className="server-logs">
          {server.logs || "No logs available"}
        </div>

      </div>
    </DashboardLayout>
  );
}
