import { minimatch } from "minimatch";
import type { Acceptor } from "./acceptor";
import { exists, uniq } from "./util";

export function distributedAcceptor<T>(
  patterns: Record<string, Acceptor<T>>,
): Acceptor<T> {
  return {
    accept: (path, data, ...args) => {
      const matching = Object.entries(patterns).find(([pattern]) =>
        minimatch(path, pattern),
      )?.[1];

      if (!matching) return false;

      return matching.accept(path, data, ...args);
    },
    finalize: async () => {
      await Promise.all(
        uniq(Object.values(patterns))
          .map((it) => it.finalize?.())
          .filter(exists),
      );
    },
  };
}
