import { openArchive } from "zip-bun";
import type { FilterOptions } from "../options.js";
import type { Acceptor } from "./IResolver.js";
import { FilteringResolver } from "./IResolver.js";

export default class ArchiveResolver extends FilteringResolver {
  constructor(
    private readonly archive: string,
    options: FilterOptions = {},
  ) {
    super(options);
  }

  async accept(acceptor: Acceptor) {
    const reader = openArchive(this.archive);

    try {
      for (const { directory, filename } of reader.filesIterator()) {
        if (directory) continue;
        const content = reader.extractFileByName(filename);
        await acceptor(filename, content);
      }
    } finally {
      reader.close();
    }
  }
}
