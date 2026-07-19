import { readdir } from "fs/promises";
import { spawn, ChildProcess } from "child_process";
import path from "path";

export async function listServers(basePath: string) {
    const servers = await readdir(basePath, { withFileTypes: true });
    return servers
        .filter(dir => dir.isDirectory())
        .map(dir => ({
            name: dir.name,
            path: path.join(basePath, dir.name)
        }));
}

export interface RuntimeInfo {
    name: string;
    running: boolean;
}


export async function runtimes(basePath: string): Promise<RuntimeInfo[]> {
    return new Promise((resolve, reject) => {
        const psScript = `
Add-Type @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

public static class ProcCwd {
    [DllImport("ntdll.dll")]
    public static extern int NtQueryInformationProcess(IntPtr hProcess, int pic, ref PROCESS_BASIC_INFORMATION pbi, int cb, out int rl);

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_BASIC_INFORMATION {
        public IntPtr Reserved1;
        public IntPtr PebBaseAddress;
        public IntPtr Reserved2_0;
        public IntPtr Reserved2_1;
        public IntPtr UniqueProcessId;
        public IntPtr Reserved3;
    }

    [DllImport("kernel32.dll")]
    public static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, int dwSize, out int lpNumberOfBytesRead);

    public static string GetCwd(int pid) {
        using (Process p = Process.GetProcessById(pid)) {
            IntPtr hProcess = p.Handle;
            var pbi = new PROCESS_BASIC_INFORMATION();
            int rl;
            NtQueryInformationProcess(hProcess, 0, ref pbi, Marshal.SizeOf(pbi), out rl);

            int ptrSize = IntPtr.Size;
            int paramsOffset = ptrSize == 8 ? 0x20 : 0x10;
            byte[] buf = new byte[ptrSize];
            int read;
            ReadProcessMemory(hProcess, IntPtr.Add(pbi.PebBaseAddress, paramsOffset), buf, ptrSize, out read);
            IntPtr paramsAddr = ptrSize == 8 ? (IntPtr)BitConverter.ToInt64(buf, 0) : (IntPtr)BitConverter.ToInt32(buf, 0);

            int cwdOffset = ptrSize == 8 ? 0x38 : 0x24;
            byte[] unicodeStr = new byte[ptrSize == 8 ? 16 : 8];
            ReadProcessMemory(hProcess, IntPtr.Add(paramsAddr, cwdOffset), unicodeStr, unicodeStr.Length, out read);

            short length = BitConverter.ToInt16(unicodeStr, 0);
            IntPtr bufferAddr = ptrSize == 8 ? (IntPtr)BitConverter.ToInt64(unicodeStr, 8) : (IntPtr)BitConverter.ToInt32(unicodeStr, 4);

            byte[] cwdBytes = new byte[length];
            ReadProcessMemory(hProcess, bufferAddr, cwdBytes, length, out read);
            return Encoding.Unicode.GetString(cwdBytes);
        }
    }
}
"@

$procs = Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" | ForEach-Object {
    $cwd = $null
    try { $cwd = [ProcCwd]::GetCwd($_.ProcessId) } catch { }
    [PSCustomObject]@{
        ProcessId        = $_.ProcessId
        CommandLine      = $_.CommandLine
        ExecutablePath   = $_.ExecutablePath
        WorkingDirectory = $cwd
    }
}

@($procs) | ConvertTo-Json -Compress
        `;

        const encodedCommand = Buffer
            .from(psScript, "utf16le")
            .toString("base64");

        const ps = spawn("powershell", [
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-EncodedCommand", encodedCommand
        ]);

        let stdout = "";
        let stderr = "";

        ps.stdout.on("data", (d) => (stdout += d.toString()));
        ps.stderr.on("data", (d) => (stderr += d.toString()));

        ps.on("close", async (code) => {
            if (!stdout.trim()) {
                return resolve([]);
            }

            let processes;
            try {
                processes = JSON.parse(stdout);
            } catch (e) {
                console.error("JSON parse failed:", e);
                return resolve([]);
            }

            const servers = await listServers(basePath);
            const results: RuntimeInfo[] = [];
            const procList = Array.isArray(processes) ? processes : [processes];

            const normPath = (p: string) =>
                p.replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();

            for (const proc of procList) {
                if (!proc.CommandLine) continue;

                const commandLine = proc.CommandLine as string;
                const pid = proc.ProcessId;
                const normalizedCmd = commandLine.toLowerCase();

                if (proc.WorkingDirectory) {
                    const workingDir = normPath(proc.WorkingDirectory as string);

                    const server = servers.find(
                        (s) => normPath(s.path) === workingDir
                    );

                    if (server) {
                        results.push({
                            name: server.name,
                            running: true
                        });
                        continue;
                    }
                }

                const jarPathMatch = normalizedCmd.match(/-jar\s+([^\s]+)/i);
                if (jarPathMatch) {
                    const jarPath = jarPathMatch[1].replace(/"/g, "");
                    if (path.isAbsolute(jarPath)) {
                        const server = servers.find((s) =>
                            normPath(jarPath).startsWith(normPath(s.path))
                        );

                        if (server) {
                            results.push({
                                name: server.name,
                                running: true
                            });
                            continue;
                        }
                    }
                }

                console.warn(
                    `Unmatched java.exe process (pid ${pid}): could not resolve server from CWD or jar path.`
                );
            }

            resolve(results);
        });

        ps.on("error", reject);
    });
}

