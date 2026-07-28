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
