import { type Acceptor, type DataConsumer } from "./acceptor";
import { extendContext, type ContextLike } from "./context";

export function afterFinalize<Data, Context extends ContextLike>(
  acceptor: Acceptor<Data, Context>,
  finalize: NonNullable<Acceptor<Data, Context>["finalize"]>,
): Acceptor<Data, Context> {
  return {
    accept: acceptor.accept.bind(acceptor),
    finalize: async (...args) => {
      if (acceptor.finalize) await acceptor.finalize(...args);
      await finalize(...args);
    },
  };
}

export type DataTransformer<Data, Context extends ContextLike> = (
  ...args: Parameters<DataConsumer<Data, Context>>
) => Promise<Data | false> | Data | false;

export function transformData<Data, Context extends ContextLike>(
  acceptor: Acceptor<Data, Context>,
  transform: DataTransformer<Data, Context>,
): Acceptor<Data, Context> {
  return {
    accept: async (path, data, ...args) => {
      const transformed = await transform(path, data, ...args);
      if (transformed === false) return false;
      return acceptor.accept(path, Promise.resolve(transformed), ...args);
    },
    finalize: acceptor.finalize?.bind(acceptor),
  };
}

export function withContext<
  Data,
  Context extends ContextLike,
  Additional extends ContextLike,
>(
  acceptor: Acceptor<Data, Context & Additional>,
  additional: Additional,
): Acceptor<Data, Context> {
  return {
    accept: async (path, data, context) =>
      acceptor.accept(path, data, extendContext(context, additional)),
    finalize: acceptor.finalize?.bind(acceptor),
  };
}
