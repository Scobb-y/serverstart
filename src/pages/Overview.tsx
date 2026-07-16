import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import ServerCard from "./ServerCard";
import "./Overview.css";

export default function Overview() {
  const [servers, setServers] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/servers")
      .then(res => res.json())
      .then(setServers);
  }, []);

  return (
    <DashboardLayout>
      <div className="server-grid">
        {servers.map(name => (
          <ServerCard
            key={name}
            name={name}
            status="online"
            players={0}
            ram={6}
            />
        ))}
      </div>
    </DashboardLayout>
  );
}
