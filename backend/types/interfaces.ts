import type { ChildProcessWithoutNullStreams } from "child_process";

export interface ServerRow {
    name: string;
    path: string;
    java_args: string;
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
    java_args: string;
}

export interface RuntimeInfo {
    name: string;
    running: boolean;
    players: number;
}
