import { readFileSync } from "fs";
import { join } from "path/posix";
import type { Acceptor } from "../acceptor/index.js";
import { listChildren } from "../util.js";
import type { Resolver } from "./index.js";

export default class FolderResolver implements Resolver {
  constructor(private readonly folder: string) {}

  private async recursiveExtract(acceptor: Acceptor, path = ".") {
    const children = listChildren(join(this.folder, path));

    const files = children.filter((it) => it.info.isFile());
    await Promise.all(
      files.map((it) => {
        const relative = join(path, it.name);
        acceptor.accept(relative, readFileSync(it.path));
      }),
    );

    const folders = children.filter((it) => it.info.isDirectory());
    folders.forEach((it) => {
      const relative = join(path, it.name);
      this.recursiveExtract(acceptor, relative);
    });
  }

  async extract(acceptor: Acceptor) {
    await this.recursiveExtract(acceptor);
    if (acceptor.finalize) await acceptor.finalize();
  }
}
