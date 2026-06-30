import ZIP from "node-stream-zip";
import type { DataConsumer } from "../acceptor/index.js";
import promiseData from "./dataPromise.js";
import { AbstractResolver } from "./index.js";

export default class ArchiveResolver extends AbstractResolver {
  constructor(private readonly archive: string) {
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
