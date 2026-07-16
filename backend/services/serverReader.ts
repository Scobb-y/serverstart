import { readdir } from "fs/promises";
import { Router } from "express";

const router = Router();

export async function listServers(path: string) {
    const servers = await readdir(path)
    return servers
}