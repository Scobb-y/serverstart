import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.join(import.meta.dirname, "../data/servers.db")
const db = new sqlite3.Database(dbPath)

db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
        name TEXT PRIMARY KEY,
        path TEXT NOT NULL
    );
`);