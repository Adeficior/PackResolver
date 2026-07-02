import { join } from "node:path";
import { createResolver } from "../src";
import type { ResolverOptions } from "../src/options";

export default function createResourcesResolver(
  path: string,
  options: Omit<ResolverOptions, "from"> = {},
) {
  return createResolver({
    ...options,
    from: join("test/resources", path),
    logger: false,
  });
}
