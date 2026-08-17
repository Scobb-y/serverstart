import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import ServerCard from "./ServerCard";
import "./Overview.css";

export default function Overview() {

  type Server = {
    name: string;
    running: boolean;
    players: number;
    ram: number;
  };

  const [servers, setServers] = useState<Server[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  async function loadServers() {
    try {
      const res = await fetch(`${API_URL}/api/servers`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      setServers(data);
    } catch (err) {
      console.error("Failed to fetch servers:", err);
    }
  }

  if (servers.length === 0) {
    loadServers();
  }

  return (
    <DashboardLayout>
      <div className="server-grid">
        {servers.map(server => (
          <ServerCard
            key={server.name}
            name={server.name}
            status={server.running ? "online" : "offline"}
            players={server.players}
            ram={server.ram}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
