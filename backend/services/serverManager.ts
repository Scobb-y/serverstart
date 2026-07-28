// Backend/services/serverManager.ts
import { spawn } from "child_process";
import sqlite3 from "sqlite3";
import path from "path";
import type { RunningServer, ServerDefinition, ServerRow} from "../types/interfaces";

const dbPath = path.join(import.meta.dirname, "../data/servers.db");
const db = new sqlite3.Database(dbPath);

export const runningServers = new Map<string, RunningServer>();

export function launchServer(server: ServerDefinition) {
    if (runningServers.has(server.name)) {
        throw new Error(`Server ${server.name} is already running`);
    }
    console.log(server.name)

    const args = server.java_args
        ? server.java_args.split(" ")
        : ["-jar", "server.jar", "nogui"];

    const child = spawn("java", args, {
        cwd: server.path,
        stdio: ["pipe", "pipe", "pipe"]
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

                const server: ServerDefinition = {
                    name: r.name,
                    path: r.path,
                    java_args: r.java_args || undefined
                };

                resolve(server);
            }
        );
    });
}
