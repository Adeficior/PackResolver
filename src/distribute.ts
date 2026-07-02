import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor";
import type { ContextLike } from "./context";
import { exists, uniq } from "./util";

export function distributedAcceptor<Data, Context extends ContextLike>(
  patterns: Record<string, Acceptor<Data, Context>>,
  fallback?: Acceptor<Data, Context>,
): Acceptor<Data, Context> {
  const finalizes = uniq([...Object.values(patterns), fallback])
    .map((it) => it?.finalize?.bind(it))
    .filter(exists);
  return {
    accept: (path, data, ...args) => {
      const matching = Object.entries(patterns).find(([pattern]) =>
        minimatch(path, pattern),
      )?.[1];

      if (!matching) {
        if (!fallback) return false;
        return fallback.accept(path, data, ...args);
      }

      return matching.accept(path, data, ...args);
    },
    finalize: async (...args) => {
      await Promise.all(finalizes.map((it) => it(...args)));
    },
  };
}
