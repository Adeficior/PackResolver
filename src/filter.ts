import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor/index.js";
import { transformData } from "./middleware.js";
import type { FilterOptions } from "./options.js";
import type { Resolver, ResolverRunner } from "./resolver/index.js";
import { arrayOrSelf } from "./util.js";

type FilterFunction<T> = (
  path: string,
  data: PromiseLike<T>,
) => boolean | Promise<boolean>;

export function createFilter<T>(options: FilterOptions): FilterFunction<T> {
  const include = arrayOrSelf(options.include);
  const exclude = arrayOrSelf(options.exclude);
  return (path) => {
    if (include?.length)
      return include.some((pattern) => minimatch(path, pattern));

    return !exclude.some((pattern) => minimatch(path, pattern, { dot: true }));
  };
}

export function filterAcceptor<Data, Args extends unknown[]>(
  acceptor: Acceptor<Data, Args>,
  options: FilterOptions | FilterFunction<Data>,
): Acceptor<Data, Args> {
  const filter =
    typeof options === "function" ? options : createFilter(options);

  return transformData(acceptor, async (path, data, ..._args) => {
    if (!(await filter(path, data))) return false;
    return data;
  });
}

export function filterResolver<Data, Args extends unknown[]>(
  resolver: Resolver<Data, Args>,
  options: FilterOptions | FilterFunction<Data>,
): Resolver<Data, Args> {
  const extract: ResolverRunner<Data, Args> = (acceptor, ...args) => {
    const filtered = filterAcceptor(acceptor, options);
    return resolver.extract(filtered, ...args);
  };
  return { extract };
}
