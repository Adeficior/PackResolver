import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor/index.js";
import type { ContextLike } from "./context.js";
import { transformData } from "./middleware.js";
import type { FilterOptions } from "./options.js";
import type { Resolver, ResolverRunner } from "./resolver/index.js";
import { arrayOrSelf } from "./util.js";

type FilterFunction<Data, Context extends ContextLike> = (
  path: string,
  data: PromiseLike<Data>,
  context: Context,
) => boolean | Promise<boolean>;

export function createFilter<Data, Context extends ContextLike>(
  options: FilterOptions,
): FilterFunction<Data, Context> {
  const include = arrayOrSelf(options.include);
  const exclude = arrayOrSelf(options.exclude);
  return (path) => {
    if (include?.length)
      return include.some((pattern) => minimatch(path, pattern));

    return !exclude.some((pattern) => minimatch(path, pattern, { dot: true }));
  };
}

export function filterAcceptor<Data, Context extends ContextLike>(
  acceptor: Acceptor<Data, Context>,
  options: FilterOptions | FilterFunction<Data, Context>,
): Acceptor<Data, Context> {
  const filter =
    typeof options === "function" ? options : createFilter(options);

  return transformData(acceptor, async (path, data, context) => {
    if (!(await filter(path, data, context))) return false;
    return data;
  });
}

export function filterResolver<Data, Context extends ContextLike>(
  resolver: Resolver<Data, Context>,
  options: FilterOptions | FilterFunction<Data, Context>,
): Resolver<Data, Context> {
  const extract: ResolverRunner<Data, Context> = (acceptor, ...args) => {
    const filtered = filterAcceptor(acceptor, options);
    return resolver.extract(filtered, ...args);
  };
  return { extract };
}
