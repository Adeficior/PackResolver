import { zip } from "zip-a-folder";
import type { Acceptor } from ".";
import { afterAcceptor } from "../after";
import { writeToFolder } from "./folder";

// TODO options tempDir
export function writeToArchive(path: string): Acceptor {
  const tempDir = "tmp";
  const folder = writeToFolder(tempDir);

  return afterAcceptor(folder, async () => {
    if (folder.finalize) await folder.finalize();
    await zip(tempDir, path);
  });
}
