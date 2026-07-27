import { readdir } from "fs/promises";
import path from "path";
import { runningServers } from "./serverManager";
import type { RuntimeInfo } from "../types/interfaces";

export async function listServers(basePath: string) {
    const servers = await readdir(basePath, { withFileTypes: true });

    return servers
        .filter(dir => dir.isDirectory())
        .map(dir => ({
            name: dir.name,
            path: path.join(basePath, dir.name)
        }));
}

export async function runtimes(basePath: string): Promise<RuntimeInfo[]> {
    const servers = await listServers(basePath);

    return servers.map(s => ({
        name: s.name,
        running: runningServers.has(s.name)
    }));
}
