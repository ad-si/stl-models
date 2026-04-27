declare module "readdirp" {
  import { Stats } from "fs";

  interface ReaddirpEntry {
    name: string;
    fullPath: string;
    path: string;
    parentDir: string;
    fullParentDir: string;
    stat: Stats;
  }

  interface ReaddirpResult {
    directories: ReaddirpEntry[];
    files: ReaddirpEntry[];
  }

  interface ReaddirpOptions {
    root: string;
    fileFilter?: string | string[] | ((entry: ReaddirpEntry) => boolean);
    directoryFilter?:
      | string
      | string[]
      | ((entry: ReaddirpEntry) => boolean);
    depth?: number;
    entryType?: "files" | "directories" | "both" | "all";
    lstat?: boolean;
  }

  function readdirp(
    options: ReaddirpOptions,
    fileProcessed: (entry: ReaddirpEntry) => void,
    allProcessed: (error: Error | null, result: ReaddirpResult) => void,
  ): void;

  export = readdirp;
}
