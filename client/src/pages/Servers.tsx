import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ServersGrid from "../components/ServersGrid";
import { fetchDirectories } from "../api/client";

export default function Servers() {
  const [servers, setServers] = useState<string[]>([]);

  useEffect(() => {
  fetchDirectories().then(data => setServers(data.directories));
  }, []);


  return (
    <DashboardLayout title="Minecraft Servers">
      <ServersGrid servers={servers} />
    </DashboardLayout>
  );
}
