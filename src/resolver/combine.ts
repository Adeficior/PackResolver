import type { Resolver, ResolverRunner } from ".";
import type { Acceptor, CombinedResolverOptions, ResolverOptions } from "..";
import type { ContextLike } from "../context";
import { createResolvers, loggerOf, type ResolverInfo } from "./create";

export function combineResolvers<Data, Context extends ContextLike>(
  resolvers: ReadonlyArray<
    | ResolverInfo<Data, Context>
    | Resolver<Data, Context>
    | ResolverRunner<Data, Context>
  >,
  options: Pick<ResolverOptions, "logger"> & { async?: boolean } = {},
): Resolver<Data, Context> {
  const logger = loggerOf(options);
  const runners: ResolverRunner<Data, Context>[] = resolvers.map(
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
      const withoutFinalize: Acceptor<Data, Context> = {
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
