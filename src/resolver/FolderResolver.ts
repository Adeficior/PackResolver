import { readFileSync } from "fs";
import { join } from "path/posix";
import type { FilterOptions } from "../options.js";
import { listChildren } from "../util.js";
import type { Acceptor } from "./IResolver.js";
import { FilteringResolver } from "./IResolver.js";

export default class FolderResolver extends FilteringResolver {
  constructor(
    private readonly folder: string,
    options: FilterOptions = {},
  ) {
    super(options);
  }

  private recursiveExtract(acceptor: Acceptor, path = ".") {
    const children = listChildren(join(this.folder, path));

    const files = children.filter((it) => it.info.isFile());
    files.forEach((it) => {
      const relative = join(path, it.name);
      if (this.filter(relative)) acceptor(relative, readFileSync(it.path));
    });

    const folders = children.filter((it) => it.info.isDirectory());
    folders.forEach((it) => {
      const relative = join(path, it.name);
      if (this.filter(relative, { partial: true }))
        this.recursiveExtract(acceptor, relative);
    });
  }

  async accept(acceptor: Acceptor) {
    return this.recursiveExtract(acceptor);
  }
}
