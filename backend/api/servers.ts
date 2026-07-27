import { Router } from "express";
import { listServers, runtimes } from "../services/serverReader";
import { launchServer, sendCommand } from "../services/serverManager";
import { getServerFromDB } from "../data/create";

const router = Router();

router.get("/", async (req, res) => {
  const servers = await listServers("D:\\MC servers");
  const running = await runtimes("D:\\MC servers");

  const merged = servers.map(server => ({
    ...server,
    running: running.some(r => r.name === server.name)
  }));

  res.json(merged);
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
