import { join } from "node:path";
import { createResolver } from "../src";
import type Options from "../src/options";

export default function createResourcesResolver(
  path: string,
  options: Omit<Options, "from"> = {},
) {
  return createResolver({
    ...options,
    from: join("test/resources", path),
    logger: false,
  });
}
