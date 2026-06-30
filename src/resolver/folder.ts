import { readFileSync } from "fs";
import { join } from "path/posix";
import type { DataConsumer } from "../acceptor/index.js";
import { listChildren } from "../util.js";
import { AbstractResolver } from "./abstract.js";
import promiseData from "./dataPromise.js";

export default class FolderResolver extends AbstractResolver {
  constructor(private readonly folder: string) {
    super();
  }

  private async recursiveExtract(acceptor: DataConsumer, path = ".") {
    const children = listChildren(join(this.folder, path));

    const files = children.filter((it) => it.info.isFile());
    await Promise.all(
      files.map(async (it) => {
        const relative = join(path, it.name);
        await acceptor(
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

  async supply(acceptor: DataConsumer) {
    await this.recursiveExtract(acceptor);
  }
}
