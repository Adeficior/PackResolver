import type { MinimatchOptions } from "minimatch";
import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor/index.js";
import type { FilterOptions } from "./options.js";
import type { Resolver, ResolverRunner } from "./resolver/index.js";
import { arrayOrSelf } from "./util.js";

export function createFilter(options: FilterOptions) {
  const include = arrayOrSelf(options.include);
  const exclude = arrayOrSelf(options.exclude);
  return (value: string, options: MinimatchOptions = {}) => {
    if (include?.length)
      return include.some((pattern) => minimatch(value, pattern, options));

    return !exclude.some((pattern) => minimatch(value, pattern, { dot: true }));
  };
}

export function filterAcceptor(
  acceptor: Acceptor,
  options: FilterOptions | ((path: string) => boolean),
): Acceptor {
  const filter =
    typeof options === "function" ? options : createFilter(options);

  return {
    accept: (path, ...args) => {
      if (!filter(path)) return false;
      return acceptor.accept(path, ...args);
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
