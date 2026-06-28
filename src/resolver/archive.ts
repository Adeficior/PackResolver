import ZIP from "node-stream-zip";
import type { Acceptor } from "../acceptor/index.js";
import { type Resolver } from "./index.js";

export default class ArchiveResolver implements Resolver {
  constructor(private readonly archive: string) {}

  async extract(acceptor: Acceptor) {
    const zip = new ZIP.async({ file: this.archive });

    try {
      const entries = await zip.entries();
      await Promise.all(
        Object.values(entries).map(async (entry) => {
          if (entry.isFile) {
            await acceptor.accept(entry.name, await zip.entryData(entry));
          }
        }),
      );

      if (acceptor.finalize) await acceptor.finalize();
    } catch (cause) {
      throw new Error(`unable to load ${this.archive}`, { cause });
    } finally {
      zip.close();
    }
  }
}
