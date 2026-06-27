import type { MergeStrategy } from ".";
import type { ResolverRunner } from "../resolver";

export class OverwriteStrategy implements MergeStrategy {
  constructor(private readonly options: { async?: boolean } = {}) {}

  merge(resolvers: Array<ResolverRunner>): ResolverRunner {
    return async (acceptor) => {
      if (this.options.async) {
        await Promise.all(resolvers.map((run) => run(acceptor)));
      } else {
        for (const run of resolvers) {
          await run(acceptor);
        }
      }
    };
  }
}
