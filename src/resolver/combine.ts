import type { Resolver, ResolverRunner } from ".";
import type { Acceptor, CombinedResolverOptions, ResolverOptions } from "..";
import { createResolvers, loggerOf, type ResolverInfo } from "./create";

export function combineResolvers<Data, Args extends unknown[]>(
  resolvers: ReadonlyArray<
    ResolverInfo<Data, Args> | Resolver<Data, Args> | ResolverRunner<Data, Args>
  >,
  options: Pick<ResolverOptions, "logger"> & { async?: boolean } = {},
): Resolver<Data, Args> {
  const logger = loggerOf(options);
  const runners: ResolverRunner<Data, Args>[] = resolvers.map(
    (it) =>
      (acceptor, ...args) => {
        if (typeof it === "function") return it(acceptor, ...args);
        if ("extract" in it) return it.extract(acceptor, ...args);
        logger.info(it.name);
        return it.resolver.extract(acceptor, ...args);
      },
  );

  return {
    extract: async (acceptor, ...args) => {
      const withoutFinalize: Acceptor<Data, Args> = {
        accept: acceptor.accept.bind(acceptor),
      };
      if (options?.async) {
        await Promise.all(runners.map((run) => run(withoutFinalize, ...args)));
      } else {
        for (const run of runners) {
          await run(withoutFinalize, ...args);
        }
      }

      if (acceptor.finalize) await acceptor.finalize(...args);
    },
  };
}

export function createCombinedResolver(options: CombinedResolverOptions) {
  const resolvers = createResolvers(options);
  return combineResolvers(resolvers, options);
}
