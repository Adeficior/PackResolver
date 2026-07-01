import { simpleResolver, type Acceptable, type Resolver } from "../index.js";

export function createTestResolver(
  files: Record<string, Acceptable>,
): Resolver {
  return simpleResolver(async (acceptor) => {
    await Promise.all(
      Object.entries(files).map(([path, data]) =>
        acceptor(path, Promise.resolve(data)),
      ),
    );
  });
}
