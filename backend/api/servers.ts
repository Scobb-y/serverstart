import { Router } from "express";
import { listServers, runtimes } from "../services/serverReader";
import { launchServer, sendCommand, getServerFromDB } from "../services/serverManager";
import { RuntimeInfo, ServerDefinition } from "../types/interfaces"
import { get } from "http";
const router = Router();

router.get("/", async (req, res) => {
  const servers = await listServers("D:\\MC servers");
  const running = await runtimes("D:\\MC servers");

  const merged = await Promise.all(
    servers.map(async server => {
      const match = running.find(r => r.name === server.name);
      const serverInfo = await getServerFromDB(server.name);

      return {
        ...server,
        running: match?.running ?? false,
        players: 0,
        ram: serverInfo.ram
      };
    })
  );

  res.json(merged);
});

router.get("/:name", async (req, res) => {
  const name = req.params.name;

  const servers = await listServers("D:\\MC servers");
  const server = servers.find(s => s.name === name);

  if (!server) {
    return res.status(404).json({ error: "Server not found" });
  }

  const runningServers = await runtimes("D:\\MC servers");
  const runtime: RuntimeInfo = runningServers.find(r => r.name === name) ?? {
    name,
    running: false,
    players: 0,
  };


  const dbInfo = await getServerFromDB(name);

  res.json({
    name: dbInfo.name,
    status: runtime.running ? "online" : "offline",
    players: 0,
    ram: dbInfo.ram ?? 2,
    jarArgs: dbInfo?.java_args ?? "-Xms2G -Xmx2G"
  });
});




router.post("/:name/start", async (req, res) => {
  const server = await getServerFromDB(req.params.name);

  const result = launchServer(server);
  res.json(result);
});


router.post("/:name/stop", async (req, res) => {
  sendCommand(req.params.name, "stop");
  res.json({ ok: true });
});

router.post("/:name/command", async (req, res) => {
  sendCommand(req.params.name, req.body.command);
  res.json({ ok: true });
});

export default router;
