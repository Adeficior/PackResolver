import type { Resolver, ResolverRunner } from ".";
import type { Acceptor, CombinedResolverOptions } from "..";
import type { ContextLike } from "../context";
import { createResolvers } from "./create";

export function combineResolvers<Data, Context extends ContextLike>(
  resolvers: ReadonlyArray<
    Resolver<Data, Context> | ResolverRunner<Data, Context>
  >,
  options: { async?: boolean } = {},
): Resolver<Data, Context> {
  const runners: ResolverRunner<Data, Context>[] = resolvers.map(
    (it) =>
      (acceptor, ...args) => {
        if (typeof it === "function") return it(acceptor, ...args);
        return it.extract(acceptor, ...args);
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

export function createCombinedResolver(
  options: CombinedResolverOptions & { async?: boolean },
) {
  const resolvers = createResolvers(options);
  return combineResolvers(resolvers, options);
}
