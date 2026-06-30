import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Acceptor } from ".";

// TODO options cleanup
export function writeToFolder(path: string): Acceptor {
  return {
    accept: async (subPath, data) => {
      const out = join(path, subPath);

      if (!existsSync(dirname(out))) {
        mkdirSync(dirname(out), { recursive: true });
      }

      writeFileSync(out, await data);
    },
  };
}
