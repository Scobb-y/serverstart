import { Router } from "express";
import { listServers } from "../services/serverReader";

const router = Router();

router.get("/", async (req, res) => {
  const servers = await listServers("D:\\MC servers");
  res.json(servers);
});

export default router;