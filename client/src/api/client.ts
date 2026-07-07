import { DirectoryResponse } from "../types/DirectoryResponse";

export async function fetchDirectories() {
  const res = await fetch("http://localhost:3000/servers/list");
  return res.json();
}

export async function startServer(name: string) {
  await fetch(`http://localhost:3000/servers/start/${name}`, {
    method: "POST"
  });
}
