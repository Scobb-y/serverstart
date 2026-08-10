// Backend/services/serverManager.ts
import { spawn } from "child_process";
import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";
import type { RunningServer, ServerDefinition, ServerRow} from "../types/interfaces";

const dbPath = path.join(import.meta.dirname, "../data/servers.db");
const db = new sqlite3.Database(dbPath);

export const runningServers = new Map<string, RunningServer>();

function parseJavaArgs(args: string) {
  const xmx = args.match(/-Xmx(\d+)([MG])/i);
  const xms = args.match(/-Xms(\d+)([MG])/i);

  if (!xmx) return null; 
  if (!xms) return null;

  const maxValue = parseInt(xmx[1], 10);
  const maxUnit = xmx[2].toUpperCase();
  const maxRamGB = maxUnit === "G" ? maxValue : maxValue / 1024;

  let minRamGB = maxRamGB;

  if (xms) {
    const minValue = parseInt(xms[1], 10);
    const minUnit = xms[2].toUpperCase();
    minRamGB = minUnit === "G" ? minValue : minValue / 1024;
  }

  return {
    minRamGB,
    maxRamGB
  };
}

export function launchServer(server: ServerDefinition) {
    if (runningServers.has(server.name)) {
        throw new Error(`Server ${server.name} is already running`);
    }
    console.log(server.name)

    const requiredArgs = ["-jar", "server.jar", "nogui"];
    const userArgs = server.java_args ? server.java_args.split(" ") : [];

    const args = [...requiredArgs, ...userArgs];
    
    console.log("Launching:", "java", args, "cwd:", server.path);

    const child = spawn("java", args, {
        cwd: server.path,
        stdio: ["pipe", "pipe", "pipe"]
    });

    child.on("error", (err) => {
        const msg = `SPAWN ERROR: ${err.message}`;
        console.error(msg);

        db.run(
            `INSERT INTO server_logs (server_id, timestamp, message)
            VALUES ((SELECT id FROM servers WHERE name = ?), datetime('now'), ?)`,
            [server.name, msg]
        );
    });


    const entry: RunningServer = {
        child,
        name: server.name,
        path: server.path,
        pid: child.pid!
    };

    runningServers.set(server.name, entry);

    db.run(
        `UPDATE servers SET last_pid = ?, last_started_at = datetime('now') WHERE name = ?`,
        [child.pid, server.name]
    );

    child.stdout.on("data", (data) => {
        const msg = data.toString();
        db.run(
            `INSERT INTO server_logs (server_id, timestamp, message)
             VALUES ((SELECT id FROM servers WHERE name = ?), datetime('now'), ?)`,
            [server.name, msg]
        );
    });

    child.stderr.on("data", (data) => {
        const msg = data.toString();
        db.run(
            `INSERT INTO server_logs (server_id, timestamp, message)
             VALUES ((SELECT id FROM servers WHERE name = ?), datetime('now'), ?)`,
            [server.name, msg]
        );
    });

    child.on("exit", () => {
        runningServers.delete(server.name);
        db.run(
            `UPDATE servers SET last_stopped_at = datetime('now') WHERE name = ?`,
            [server.name]
        );
    });

    return entry;
}

export function sendCommand(serverName: string, command: string) {
    const srv = runningServers.get(serverName);
    if (!srv) throw new Error(`Server ${serverName} is not running`);

    srv.child.stdin.write(command + "\n");
}

export function stopServer(serverName: string) {
    sendCommand(serverName, "stop");
    db.run(
        `UPDATE servers SET last_stopped_at = datetime('now') WHERE name = ?`,
        [serverName]
        );
}

export async function deleteWorld(serverName: string) {
  const rootDir = process.env.ROOT_FOLDER!;
  const serverDir = path.join(rootDir, serverName);
  const worldDir = path.join(serverDir, "World");

  try {
    await fs.promises.access(worldDir);
  } catch {
    return false;
  }

  try {
    await fs.promises.rm(worldDir, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error("Failed to delete world:", err);
    return false;
  }
}


export function getServerFromDB(name: string): Promise<ServerDefinition> {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT name, path, java_args FROM servers WHERE name = ?`,
            [name],
            (err, row) => {
                if (err) return reject(err);

                if (!row) {
                    return reject(new Error(`Server '${name}' not found in database`));
                }

                const r = row as ServerRow;
                const ram = parseJavaArgs(r.java_args ?? "-Xms2G -Xmx2G") ?? {
                    minRamGB: 2,
                    maxRamGB: 2
                };

                const server: ServerDefinition = {
                    name: r.name,
                    path: r.path,
                    ram: ram.maxRamGB,
                    java_args: r.java_args && r.java_args.trim() !== "" ? r.java_args : `-Xms${ram.minRamGB}G -Xmx${ram.maxRamGB}G`
                };


                resolve(server);
            }
        );
    });
}
