import type { Acceptable, Resolver } from "../index.js";

export function createTestResolver(
  files: Record<string, Acceptable>,
): Resolver {
  return {
    extract: async (acceptor) => {
      await Promise.all(
        Object.entries(files).map(([path, data]) =>
          acceptor.accept(path, data),
        ),
      );

      // TODO helper
      if (acceptor.finalize) await acceptor.finalize();
    },
  };
}
