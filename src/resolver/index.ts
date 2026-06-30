import type { Acceptable, Acceptor } from "../acceptor/index.js";
import { AbstractResolver } from "./abstract.js";

export type ResolverRunner<T = Acceptable> = (
  acceptor: Acceptor<T>,
) => Promise<void> | void;

export interface Resolver<T = Acceptable> {
  extract: ResolverRunner<T>;
}

class SimpleResolver extends AbstractResolver {
  constructor(protected readonly supply: AbstractResolver["supply"]) {
    super();
  }
}

export function simpleResolver(supply: AbstractResolver["supply"]): Resolver {
  return new SimpleResolver(supply);
}
