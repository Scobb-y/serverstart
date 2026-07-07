import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export async function getDirectories(basePath: string): Promise<string[]> {
  const entries = await fs.readdir(basePath, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

export function launchServer(name: string) {
  const serverPath = path.join("D:\\MC servers", name);
  const jarPath = path.join(serverPath, "server.jar");

  const process = spawn("java", ["-Xmx2G", "-Xms1G", "-jar", jarPath, "nogui"], {
    cwd: serverPath
  });

  process.stdout.on("data", data => console.log(`[${name}] ${data}`));
  process.stderr.on("data", data => console.error(`[${name} ERROR] ${data}`));
}
