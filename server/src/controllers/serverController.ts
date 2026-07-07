import { Request, Response } from "express";
import { getDirectories, launchServer } from "../utils/processManager";

export async function listServers(req: Request, res: Response) {
  try {
    const dirs = await getDirectories("D:\\MC servers");
    res.json({ directories: dirs });
  } catch (err) {
    res.status(500).json({ error: "Failed to list servers" });
  }
}

export function startServer(req: Request, res: Response) {
  const name = req.params.name;
  launchServer(name);
  res.json({ status: "starting", server: name });
}
