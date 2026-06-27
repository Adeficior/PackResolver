import ZIP from "node-stream-zip";
import type { FilterOptions } from "../options.js";
import type { Acceptor } from "./index.js";
import { FilteringResolver } from "./index.js";

export default class ArchiveResolver extends FilteringResolver {
  constructor(
    private readonly archive: string,
    options: FilterOptions = {},
  ) {
    super(options);
  }

  async accept(acceptor: Acceptor) {
    const zip = new ZIP.async({ file: this.archive });

    try {
      const entries = await zip.entries();
      await Promise.all(
        Object.values(entries)
          .filter((it) => this.filter(it.name))
          .map(async (entry) => {
            if (entry.isFile) {
              acceptor(entry.name, await zip.entryData(entry));
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
