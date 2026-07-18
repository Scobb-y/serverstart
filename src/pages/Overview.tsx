import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import ServerCard from "./ServerCard";
import "./Overview.css";

export default function Overview() {

  type Server = {
    name: string;
    path: string;
    running: boolean;
    pid: number | null;
    jarPath: string | null;
  };

  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/servers")
      .then(res => res.json())
      .then(setServers);
  }, []);

  return (
    <DashboardLayout>
      <div className="server-grid">
        {servers.map(server=> (
          <ServerCard
            key={server.name}
            name={server.name}
            status={server.running ? "online" : "offline"}
            players={0}
            ram={6}
            />
        ))}
      </div>
    </DashboardLayout>
  );
}
