import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor";
import { exists, uniq } from "./util";

export function distributedAcceptor<Data, Args extends unknown[]>(
  patterns: Record<string, Acceptor<Data, Args>>,
  fallback?: Acceptor<Data, Args>,
): Acceptor<Data, Args> {
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
