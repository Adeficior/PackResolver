import type { Acceptable, Acceptor } from "../acceptor/index.js";
import type { BaseContext, ContextLike } from "../context.js";
import { AbstractResolver } from "./abstract.js";

export type ResolverRunner<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
> = (acceptor: Acceptor<Data, Context>) => Promise<void> | void;

export interface Resolver<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
> {
  extract: ResolverRunner<Data, Context>;
}

class SimpleResolver<
  Data,
  Context extends ContextLike,
> extends AbstractResolver<Data, Context> {
  constructor(
    protected readonly supply: AbstractResolver<Data, Context>["supply"],
    context: Context,
  ) {
    super(context);
  }
}

export function simpleResolver<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
>(
  supply: AbstractResolver<Data, Context>["supply"],
  context: Context,
): Resolver<Data, Context> {
  return new SimpleResolver(supply, context);
}
