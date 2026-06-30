import type { Resolver, ResolverRunner } from ".";
import type { Acceptor, CombinedResolverOptions, ResolverOptions } from "..";
import { createResolvers, loggerOf, type ResolverInfo } from "./create";

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
      const withoutFinalize: Acceptor<T> = { accept: acceptor.accept };
      if (options?.async) {
        await Promise.all(runners.map((run) => run(withoutFinalize)));
      } else {
        for (const run of runners) {
          await run(withoutFinalize);
        }
      }

      if (acceptor.finalize) await acceptor.finalize();
    },
  };
}

export function createCombinedResolver(options: CombinedResolverOptions) {
  const resolvers = createResolvers(options);
  return combineResolvers(resolvers, options);
}
