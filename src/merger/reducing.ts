import type { MergeStrategy } from ".";
import type { Acceptable, Acceptor, ResolverRunner } from "../resolver";

export abstract class ReducingStrategy implements MergeStrategy {
  protected abstract mergeData(
    previous: Acceptable,
    next: Acceptable,
  ): Acceptable;

  merge(runners: Array<ResolverRunner>): ResolverRunner {
    return async (acceptor) => {
      const cache = new Map<string, Acceptable>();

      const wrappedAcceptor: Acceptor = async (path, data, ...args) => {
        const previous = cache.get(path);
        const merged = previous ? this.mergeData(previous, data) : data;
        cache.set(path, merged);
        return acceptor(path, merged, ...args);
      };

      for (const run of runners) {
        await run(wrappedAcceptor);
      }
    };
  }
}
