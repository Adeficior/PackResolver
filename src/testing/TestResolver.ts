import type { Options } from "../../src/index.js";
import { createMergedResolver } from "../../src/index.js";

export function createTestResolver(options: Partial<Options>) {
  return createMergedResolver({
    silent: true,
    from: "test/resources",
    ...options,
  });
}
