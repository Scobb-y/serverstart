import { Router } from "express";
import { listServers, runtimes } from "../services/serverReader";

const router = Router();

router.get("/", async (req, res) => {
  const servers = await listServers("D:\\MC servers");
  const running = await runtimes("D:\\MC servers");

  console.log(running)

  const merged = servers.map(server => {
    const match = running.find(r => r.name === server.name);
      return {
        ...server,
        running: !!match,
      };
  });
  res.json(merged);
});

export default router;