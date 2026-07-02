import ZIP from "node-stream-zip";
import type { Acceptable } from "../acceptor/index.js";
import type { ContextLike } from "../context.js";
import {
  AbstractResolver,
  type DataConsumerWithoutContext,
} from "./abstract.js";
import promiseData from "./dataPromise.js";

export default class ArchiveResolver<
  Context extends ContextLike,
> extends AbstractResolver<Acceptable, Context & { source: string }> {
  constructor(
    private readonly archive: string,
    context: Context,
  ) {
    super({ ...context, source: archive });
  }

  async supply(acceptor: DataConsumerWithoutContext<Acceptable>) {
    const zip = new ZIP.async({ file: this.archive });

    try {
      const entries = await zip.entries();
      await Promise.all(
        Object.values(entries).map(async (entry) => {
          if (entry.isFile) {
            await acceptor(
              entry.name,
              promiseData(() => zip.entryData(entry)),
            );
          }
        }),
      );
    } catch (cause) {
      throw new Error(`unable to load ${this.archive}`, { cause });
    } finally {
      zip.close();
    }
  }
}
