import { useEffect, useState } from "react";
import {
  startServer,
  stopServer,
  restartServer,
  sendCommand,
  getStatus,
  streamLogs
} from "../api/client";

export default function ServerCard({ name }: { name: string }) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  useEffect(() => {
    getStatus(name).then(s => setRunning(s.running));

    const evt = streamLogs(name, line => {
      setLogs(prev => [...prev, line]);
    });

    return () => evt.close();
  }, [name]);

  return (
    <div className="server-card">
      <h3>{name}</h3>

      <p>Status: {running ? "🟢 Running" : "🔴 Stopped"}</p>

      <div className="buttons">
        <button onClick={() => startServer(name)}>Start</button>
        <button onClick={() => stopServer(name)}>Stop</button>
        <button onClick={() => restartServer(name)}>Restart</button>
      </div>

      <div className="command-box">
        <input
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="Enter command..."
        />
        <button onClick={() => sendCommand(name, command)}>Send</button>
      </div>

      <div className="logs">
        <h4>Logs</h4>
        <pre>{logs.join("\n")}</pre>
      </div>
    </div>
  );
}
