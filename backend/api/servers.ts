import { Router } from "express";
import { listServers, runtimes } from "../services/serverReader";
import { launchServer, sendCommand, getServerFromDB, deleteWorld } from "../services/serverManager";
import { RuntimeInfo } from "../types/interfaces"
import path from "path";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import db from "../data/create";

dotenv.config()
const router = Router();
const ROOT_DIR = process.env.ROOT_FOLDER!;

router.get("/", async (req, res) => {
  const servers = await listServers(ROOT_DIR);
  const running = await runtimes(ROOT_DIR);

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

  const servers = await listServers(ROOT_DIR);
  const server = servers.find(s => s.name === name);

  if (!server) {
    return res.status(404).json({ error: "Server not found" });
  }

  const runningServers = await runtimes(ROOT_DIR);
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
    jarArgs: dbInfo?.java_args ?? "-Xms2G -Xmx2G",
    version: dbInfo.version ?? "unknown",
    logs: ""
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

router.post("/:name/java-args", async (req, res) => {
  const runningServers = await runtimes(ROOT_DIR);
  const runtime = runningServers.find(r => r.name === req.params.name);

  if (runtime?.running) {
    return res.status(400).json({
      error: "Cannot update Java args while server is online."
    });
  }

  const { java_args } = req.body;

  if (!java_args) {
    return res.status(400).json({
      error: "java_args is required"
    });
  }

  db.run(
    `UPDATE servers SET java_args = ? WHERE name = ?`,
    [java_args, req.params.name]
  );

  res.json({ success: true });
});

router.post("/:name/version", (req, res) => {
  const { version } = req.body;

  db.run(
    `UPDATE servers SET version = ? WHERE name = ?`,
    [version, req.params.name],
    (err) => {
      if (err) return res.status(500).json({ error: "DB update failed" });
      res.json({ success: true });
    }
  );
});


router.delete("/:name/delete-world", async(req, res) => {
  const runningServers = await runtimes(ROOT_DIR);
  const runtime = runningServers.find(r => r.name === req.params.name);

  if (runtime?.running) {
    return res.status(400).json({
      error: "Cannot delete world while server is online."
    });
  }

  const success = await deleteWorld(req.params.name);

  res.json({ success });
});


export default router;
