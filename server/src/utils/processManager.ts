import fs from "fs/promises";
import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import type { Response } from "express";

const BASE_PATH = "D:\\MC servers";

const runningServers: Record<string, ChildProcessWithoutNullStreams> = {};
const logSubscribers: Record<string, Response[]> = {};

export async function getDirectories(): Promise<string[]> {
  const entries = await fs.readdir(BASE_PATH, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

export function launchServer(name: string) {
  if (runningServers[name]) return;

  const serverPath = path.join(BASE_PATH, name);
  const jarPath = path.join(serverPath, "server.jar");

  const proc = spawn("java", ["-Xmx2G", "-Xms1G", "-jar", jarPath, "nogui"], {
    cwd: serverPath
  });

  runningServers[name] = proc;
  logSubscribers[name] = [];

  proc.stdout.on("data", data => {
    const line = data.toString();
    console.log(`[${name}] ${line}`);
    broadcastLog(name, line);
  });

  proc.stderr.on("data", data => {
    const line = data.toString();
    console.error(`[${name} ERROR] ${line}`);
    broadcastLog(name, line);
  });

  proc.on("close", () => {
    delete runningServers[name];
    broadcastLog(name, `Server ${name} stopped`);
  });
}

export function sendCommand(name: string, command: string) {
  const proc = runningServers[name];
  if (!proc) throw new Error(`${name} is not running`);
  proc.stdin.write(command + "\n");
}

export function stopServer(name: string) {
  const proc = runningServers[name];
  if (!proc) return;
  proc.stdin.write("stop\n");
}

export function restartServer(name: string) {
  stopServer(name);
  setTimeout(() => launchServer(name), 3000);
}

export function isRunning(name: string): boolean {
  return !!runningServers[name];
}

export function subscribeLogs(name: string, res: Response) {
  logSubscribers[name].push(res);
}

function broadcastLog(name: string, line: string) {
  for (const res of logSubscribers[name]) {
    res.write(`data: ${line}\n\n`);
  }
}

