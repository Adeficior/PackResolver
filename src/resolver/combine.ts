import type { Resolver, ResolverRunner } from ".";
import type { ResolverOptions } from "..";
import { loggerOf, type ResolverInfo } from "./create";

export function combineResolvers<T>(
  resolvers: ReadonlyArray<ResolverInfo<T> | Resolver<T> | ResolverRunner<T>>,
  options: Pick<ResolverOptions, "logger"> & { async?: boolean } = {},
): Resolver<T> {
  const logger = loggerOf(options);
  const runners: ResolverRunner<T>[] = resolvers.map((it) => (acceptor) => {
    if (typeof it === "function") return it(acceptor);
    if ("extract" in it) return it.extract(acceptor);
    logger.info(it.name);
    return it.resolver.extract(acceptor);
  });

  return {
    extract: async (acceptor) => {
      if (options?.async !== false) {
        await Promise.all(runners.map((run) => run(acceptor)));
      } else {
        for (const run of runners) {
          await run(acceptor);
        }
      }
    },
  };
}
