import type { Logger } from "../logger";
import type { ResolverRunner } from "../resolver";

export interface MergeStrategy {
  merge(resolvers: Array<ResolverRunner>, logger: Logger): ResolverRunner;
}
