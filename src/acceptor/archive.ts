import { zip } from "zip-a-folder";
import type { Acceptor } from ".";
import { afterAcceptor } from "../after";
import { writeToFolder } from "./folder";

export type ArchiveAcceptorOptions = {
  tempDir?: string;
};

export function writeToArchive(
  path: string,
  { tempDir = "tmp" }: ArchiveAcceptorOptions = {},
): Acceptor {
  const folder = writeToFolder(tempDir);

  return afterAcceptor(folder, async () => {
    if (folder.finalize) await folder.finalize();
    await zip(tempDir, path);
  });
}
