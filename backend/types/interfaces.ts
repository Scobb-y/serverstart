import type { ChildProcessWithoutNullStreams } from "child_process";

export interface ServerRow {
    name: string;
    path: string;
    java_args?: string | null;
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
    java_args?: string;
}

export interface RuntimeInfo {
    name: string;
    running: boolean;
}
