export async function fetchDirectories() {
  return fetch("http://localhost:3000/servers/list").then(r => r.json());
}

export async function startServer(name: string) {
  return fetch(`http://localhost:3000/servers/start/${name}`, { method: "POST" });
}

export async function stopServer(name: string) {
  return fetch(`http://localhost:3000/servers/stop/${name}`, { method: "POST" });
}

export async function restartServer(name: string) {
  return fetch(`http://localhost:3000/servers/restart/${name}`, { method: "POST" });
}

export async function sendCommand(name: string, command: string) {
  return fetch(`http://localhost:3000/servers/command/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });
}

export async function getStatus(name: string) {
  return fetch(`http://localhost:3000/servers/status/${name}`).then(r => r.json());
}

export function streamLogs(name: string, onLine: (line: string) => void) {
  const evt = new EventSource(`http://localhost:3000/servers/logs/${name}`);
  evt.onmessage = e => onLine(e.data);
  return evt;
}
