import type { Acceptor, DataConsumer } from "./acceptor";

export function afterFinalize<T>(
  acceptor: Acceptor<T>,
  finalize: NonNullable<Acceptor<T>["finalize"]>,
): Acceptor<T> {
  return {
    accept: acceptor.accept.bind(acceptor),
    finalize: async () => {
      if (acceptor.finalize) await acceptor.finalize();
      await finalize();
    },
  };
}

export type DataTransformer<T> = (
  ...args: Parameters<DataConsumer<T>>
) => Promise<T | false> | T | false;

export function transformData<T>(
  acceptor: Acceptor<T>,
  transform: DataTransformer<T>,
): Acceptor<T> {
  return {
    accept: async (path, data, ...args) => {
      const transformed = await transform(path, data, ...args);
      if (transformed === false) return false;
      return acceptor.accept(path, Promise.resolve(transformed), ...args);
    },
    finalize: acceptor.finalize?.bind(acceptor),
  };
}
