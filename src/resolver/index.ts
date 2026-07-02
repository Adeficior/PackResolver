import type { Acceptable, Acceptor } from "../acceptor/index.js";
import { AbstractResolver } from "./abstract.js";

export type ResolverRunner<Data = Acceptable, Args extends unknown[] = []> = (
  acceptor: Acceptor<Data, Args>,
  ...args: Args
) => Promise<void> | void;

export interface Resolver<Data = Acceptable, Args extends unknown[] = []> {
  extract: ResolverRunner<Data, Args>;
}

class SimpleResolver<Data> extends AbstractResolver<Data> {
  constructor(protected readonly supply: AbstractResolver<Data>["supply"]) {
    super();
  }
}

export function simpleResolver<Data = Acceptable>(
  supply: AbstractResolver<Data>["supply"],
): Resolver<Data> {
  return new SimpleResolver(supply);
}
