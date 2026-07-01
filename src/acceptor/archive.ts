import { exists } from "node:fs/promises";
import { zip } from "zip-a-folder";
import type { Acceptor } from ".";
import { afterFinalize } from "../middleware";
import createTempDir, { type TempDir } from "../temp";
import { writeToFolder } from "./folder";

export type ArchiveAcceptorOptions = {
  tempDir?: string;
};

export function writeToArchive(
  path: string,
  options: ArchiveAcceptorOptions = {},
): Acceptor {
  const tempDir: TempDir = options.tempDir
    ? { path: options.tempDir }
    : createTempDir();

  const folder = writeToFolder(tempDir.path);

  return afterFinalize(folder, async () => {
    if (folder.finalize) await folder.finalize();
    if (await exists(tempDir.path)) {
      await zip(tempDir.path, path);
    }
    tempDir.removeCallback?.();
  });
}
