import type { Options } from "../index.js";
import { createMergedResolver } from "../index.js";

export function createTestResolver(options: Partial<Options>) {
  return createMergedResolver({
    silent: true,
    from: "test/resources",
    ...options,
  });
}
