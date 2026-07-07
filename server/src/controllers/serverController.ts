import { Request, Response } from "express";

import {
  getDirectories,
  launchServer,
  sendCommand,
  isRunning,
  stopServer,
  restartServer,
  subscribeLogs
} from "../utils/processManager";

export async function listServers(req: Request, res: Response) {
  const dirs = await getDirectories();
  res.json({ directories: dirs });
}

export function startServer(req: Request, res: Response) {
  launchServer(req.params.name);
  res.json({ status: "starting" });
}

export function sendServerCommand(req: Request, res: Response) {
  try {
    sendCommand(req.params.name, req.body.command);
    res.json({ status: "sent" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export function getServerStatus(req: Request, res: Response) {
  res.json({ running: isRunning(req.params.name) });
}

export function stopServerRoute(req: Request, res: Response) {
  stopServer(req.params.name);
  res.json({ status: "stopping" });
}

export function restartServerRoute(req: Request, res: Response) {
  restartServer(req.params.name);
  res.json({ status: "restarting" });
}

export function streamLogs(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  subscribeLogs(req.params.name, res);
}
