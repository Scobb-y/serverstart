import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.join(import.meta.dirname, "../data/servers.db")
const db = new sqlite3.Database(dbPath)

db.exec(`
    CREATE TABLE servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    path TEXT NOT NULL,
    java_args TEXT,
    version TEXT,
    jar_name TEXT,
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
