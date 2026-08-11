import type { ChildProcessWithoutNullStreams } from "child_process";

export interface ServerRow {
    name: string;
    path: string;
    jar_name: string;
    java_args: string;
    version: string;
}

export interface RunningServer {
    child: ChildProcessWithoutNullStreams;
    name: string;
    path: string;
    pid: number;
}

export interface ServerDefinition {
    name: string;
    path: string;
    ram: number;
    jar_name: string;
    version: string;
    java_args: string;
}

export interface RuntimeInfo {
    name: string;
    running: boolean;
    players: number;
}
