import { join } from "node:path";
import type { Options } from "../index.js";
import { createMergedResolver } from "../index.js";

const base = "test/resources";

export function createTestResolver(
  folder: string,
  options: Partial<Options> = {},
) {
  const from = join(base, folder);
  return createMergedResolver({
    silent: true,
    from,
    ...options,
  });
}
