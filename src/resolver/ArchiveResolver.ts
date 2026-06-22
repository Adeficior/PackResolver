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
    const tarball = await Bun.file(this.archive).bytes();
    const archive = new Bun.Archive(tarball);

    for (const [filename, file] of await archive.files()) {
      const content = await file.bytes();
      await acceptor(filename, content);
    }
  }
}
