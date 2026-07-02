import ZIP from "node-stream-zip";
import type { Acceptable, DataConsumer } from "../acceptor/index.js";
import type { Logger } from "../logger.js";
import { AbstractResolver } from "./abstract.js";
import promiseData from "./dataPromise.js";

export default class ArchiveResolver extends AbstractResolver<Acceptable> {
  constructor(
    private readonly archive: string,
    private readonly logger: Logger,
  ) {
    super();
  }

  async supply(acceptor: DataConsumer) {
    const zip = new ZIP.async({ file: this.archive });

    try {
      const entries = await zip.entries();
      await Promise.all(
        Object.values(entries).map(async (entry) => {
          if (entry.isFile) {
            await acceptor(
              entry.name,
              promiseData(() => zip.entryData(entry)),
              this.logger,
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
