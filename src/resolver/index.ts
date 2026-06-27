import { createFilter } from "../filter.js";
import type { FilterOptions } from "../options.js";

export type ResolverRunner<T = Acceptable> = (
  acceptor: Acceptor<T>,
) => Promise<void> | void;

export interface Resolver<T = Acceptable> {
  extract: ResolverRunner<T>;
}

export type Acceptable = string | NodeJS.ArrayBufferView;

export interface Acceptor<T = Acceptable> {
  (path: string, content: T): void | false | Promise<void | false>;
}

export abstract class FilteringResolver implements Resolver {
  protected readonly filter;

  constructor(options: FilterOptions = {}) {
    this.filter = createFilter(options);
  }

  abstract accept(acceptor: Acceptor): Promise<void>;

  async extract(acceptor: Acceptor) {
    return this.accept((path, content) => {
      return acceptor(path, content);
    });
  }
}
