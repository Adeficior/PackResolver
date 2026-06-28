import { zip } from "zip-a-folder";
import type { Acceptor } from ".";
import { writeToFolder } from "./folder";

// TODO options tempDir
export function writeToArchive(path: string): Acceptor {
  const tempDir = "tmp";
  const folder = writeToFolder(tempDir);

  return {
    // TODO create after API
    accept: folder.accept,
    finalize: async () => {
      if (folder.finalize) await folder.finalize();
      await zip(tempDir, path);
    },
  };
}
