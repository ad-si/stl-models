declare module "findit2" {
  import { EventEmitter } from "events";
  import { Stats } from "fs";

  interface FinditEmitter extends EventEmitter {
    on(event: "file", listener: (file: string, stat: Stats) => void): this;
    on(
      event: "directory",
      listener: (directory: string, stat: Stats, stop: () => void) => void,
    ): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }

  function findit(basedir: string, options?: object): FinditEmitter;
  export = findit;
}
