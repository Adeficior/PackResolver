import type { BaseContext, ContextLike } from "../context";

export type Acceptable = string | NodeJS.ArrayBufferView;

// TODO change order
export type DataConsumer<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
> = (
  path: string,
  content: PromiseLike<Data>,
  context: Context,
) => void | false | Promise<void | false>;

export interface Acceptor<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
> {
  accept: DataConsumer<Data, Context>;
  finalize?: () => void | Promise<void>;
}

export function simpleAcceptor<
  Data = Acceptable,
  Context extends ContextLike = BaseContext,
>(accept: DataConsumer<Data, Context>): Acceptor<Data, Context> {
  return { accept };
}
