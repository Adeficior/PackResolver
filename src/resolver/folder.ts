import { readFileSync } from "fs";
import { join } from "path/posix";
import type { Acceptable } from "../acceptor/index.js";
import type { ContextLike } from "../context.js";
import { listChildren } from "../util.js";
import {
  AbstractResolver,
  type DataConsumerWithoutContext,
} from "./abstract.js";
import promiseData from "./dataPromise.js";

export default class FolderResolver<
  Context extends ContextLike,
> extends AbstractResolver<Acceptable, Context & { source: string }> {
  constructor(
    private readonly folder: string,
    context: Context,
  ) {
    super({ ...context, source: folder });
  }

  private async recursiveExtract(
    acceptor: DataConsumerWithoutContext<Acceptable>,
    path = ".",
  ) {
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

  async supply(acceptor: DataConsumerWithoutContext<Acceptable>) {
    await this.recursiveExtract(acceptor);
  }
}
