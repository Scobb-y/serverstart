import { readdir } from "fs/promises";
import path from "path";
import { runningServers } from "./serverManager";
import type { RuntimeInfo } from "../types/interfaces";
import sqlite3 from "sqlite3";
import fs from "fs";
import db from "../data/create";


export async function listServers(basePath: string) {
    const entries = await readdir(basePath, { withFileTypes: true });
    const servers = entries.filter(dir => dir.isDirectory());

    for (const dir of servers) {
        const name = dir.name;
        const serverPath = path.join(basePath, name);
        const jar = fs.readdirSync(serverPath).find(f => f.endsWith(".jar"));


        await new Promise<void>((resolve, reject) => {
            db.get(
                `SELECT id FROM servers WHERE name = ?`,
                [name],
                (err, row) => {
                    if (err) return reject(err);

                    if (!row) {
                        db.run(
                            `INSERT INTO servers 
                             (name, path, java_args, version, jar_name, last_pid, last_started_at, last_stopped_at)
                             VALUES (?, ?, NULL, 'unknown', ?, NULL, NULL, NULL)`,
                            [name, serverPath, jar],
                            (err2) => {
                                if (err2) return reject(err2);
                                resolve();
                            }
                        );
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    return servers.map(dir => ({
        name: dir.name,
        path: path.join(basePath, dir.name)
    }));
}

export async function runtimes(basePath: string): Promise<RuntimeInfo[]> {
    const servers = await listServers(basePath);

    return Promise.all(
        servers.map(async s => {
            const running = runningServers.has(s.name);

            return {
                name: s.name,
                running,
                players: 0
            };
        })
    );
}
