import path from 'path';
import sqlite3 from 'sqlite3';
import type { ServerDefinition } from "../types/interfaces";

const dbPath = path.join(import.meta.dirname, "../data/servers.db")
const db = new sqlite3.Database(dbPath)

db.exec(`
    CREATE TABLE servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    path TEXT NOT NULL,
    java_args TEXT NOT NULL,
    auto_start INTEGER DEFAULT 0,
    last_pid INTEGER,
    last_started_at TEXT,
    last_stopped_at TEXT
    );

    CREATE TABLE server_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        message TEXT NOT NULL,
        FOREIGN KEY(server_id) REFERENCES servers(id)
    );

`);

interface ServerRow {
    name: string;
    path: string;
    java_args?: string | null;
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
