import type { Acceptable, Acceptor } from "../acceptor/index.js";

export type ResolverRunner<T = Acceptable> = (
  acceptor: Acceptor<T>,
) => Promise<void> | void;

export interface Resolver<T = Acceptable> {
  extract: ResolverRunner<T>;
}
