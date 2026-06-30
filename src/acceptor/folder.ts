import { exists, mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Acceptor } from ".";

export type FolderAcceptorOptions = {
  clean?: boolean;
};

async function emptyDirSync(path: string) {
  for (const file of await readdir(path)) {
    await unlink(join(path, file));
  }
}

export function writeToFolder(
  path: string,
  { clean = false }: FolderAcceptorOptions = {},
): Acceptor {
  let cleaned = !clean;
  return {
    accept: async (subPath, data) => {
      if (!cleaned) {
        cleaned = true;
        await emptyDirSync(path);
      }

      const out = join(path, subPath);

      if (!(await exists(dirname(out)))) {
        await mkdir(dirname(out), { recursive: true });
      }
      await writeFile(out, await data);
    },
  };
}
