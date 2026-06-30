import { readFileSync } from "fs";
import { join } from "path/posix";
import type { Acceptor } from "../acceptor/index.js";
import { listChildren } from "../util.js";
import promiseData from "./dataPromise.js";
import type { Resolver } from "./index.js";

export default class FolderResolver implements Resolver {
  constructor(private readonly folder: string) {}

  private async recursiveExtract(acceptor: Acceptor, path = ".") {
    const children = listChildren(join(this.folder, path));

    const files = children.filter((it) => it.info.isFile());
    await Promise.all(
      files.map(async (it) => {
        const relative = join(path, it.name);
        await acceptor.accept(
          relative,
          promiseData(async () => readFileSync(it.path)),
        );
      }),
    );

    const folders = children.filter((it) => it.info.isDirectory());
    await Promise.all(
      folders.map(async (it) => {
        const relative = join(path, it.name);
        await this.recursiveExtract(acceptor, relative);
      }),
    );
  }

  async extract(acceptor: Acceptor) {
    await this.recursiveExtract(acceptor);
    if (acceptor.finalize) await acceptor.finalize();
  }
}
