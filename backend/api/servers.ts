import { Router } from "express";
import { listServers, runtimes } from "../services/serverReader";
import { launchServer, sendCommand, getServerFromDB } from "../services/serverManager";

const router = Router();

router.get("/", async (req, res) => {
  const servers = await listServers("D:\\MC servers");
  const running = await runtimes("D:\\MC servers");

  const merged = servers.map(server => {
  const match = running.find(r => r.name === server.name);
    return {
      ...server,
      running: match?.running ?? false,
    };
  });

  res.json(merged);
});

router.get("/:name", async (req, res) => {
  const servers = await listServers("D:\\MC servers");

  const server = servers.find(s => s.name === req.params.name);
  if (!server) {
    return res.status(404).json({ error: "Server not found" });
  }

  res.json(server);
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
