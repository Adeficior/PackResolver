import { minimatch } from "minimatch";
import type { Acceptable, Acceptor } from "./acceptor/index.js";
import type { FilterOptions } from "./options.js";
import type { Resolver, ResolverRunner } from "./resolver/index.js";
import { arrayOrSelf } from "./util.js";

type FilterFunction = (path: string, data: PromiseLike<Acceptable>) => boolean;

export function createFilter(options: FilterOptions): FilterFunction {
  const include = arrayOrSelf(options.include);
  const exclude = arrayOrSelf(options.exclude);
  return (path) => {
    if (include?.length)
      return include.some((pattern) => minimatch(path, pattern));

    return !exclude.some((pattern) => minimatch(path, pattern, { dot: true }));
  };
}

export function filterAcceptor(
  acceptor: Acceptor,
  options: FilterOptions | FilterFunction,
): Acceptor {
  const filter =
    typeof options === "function" ? options : createFilter(options);

  return {
    accept: (path, data, ...args) => {
      if (!filter(path, data)) return false;
      return acceptor.accept(path, data, ...args);
    },
    finalize: acceptor.finalize,
  };
}

export function filterResolver(
  resolver: Resolver,
  options: FilterOptions,
): Resolver {
  const extract: ResolverRunner = (acceptor) => {
    const filtered = filterAcceptor(acceptor, options);
    return resolver.extract(filtered);
  };
  return { extract };
}
