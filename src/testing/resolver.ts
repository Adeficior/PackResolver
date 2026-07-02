import {
  simpleResolver,
  type Acceptable,
  type Logger,
  type Resolver,
} from "../index.js";
import { createTestLogger } from "./logger.js";

export function createTestResolver<Data = Acceptable>(
  files: Record<string, Data>,
  logger: Logger = createTestLogger(),
): Resolver<Data> {
  return simpleResolver(
    async (acceptor) => {
      await Promise.all(
        Object.entries(files).map(([path, data]) =>
          acceptor(path, Promise.resolve(data)),
        ),
      );
    },
    { logger },
  );
}
