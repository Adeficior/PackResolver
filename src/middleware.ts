import type { Acceptor } from "./acceptor";
import promiseData from "./resolver/dataPromise";

export function afterFinalize<T>(
  acceptor: Acceptor<T>,
  finalize: NonNullable<Acceptor<T>["finalize"]>,
): Acceptor<T> {
  return {
    accept: acceptor.accept,
    finalize: async () => {
      if (acceptor.finalize) await acceptor.finalize();
      await finalize();
    },
  };
}

export type DataTransformer<T> = (
  ...args: Parameters<Acceptor<T>["accept"]>
) => Promise<T> | T;

export function transformData<T>(
  acceptor: Acceptor<T>,
  transform: DataTransformer<T>,
): Acceptor<T> {
  return {
    accept: async (path, data, ...args) => {
      const transformed = promiseData(async () =>
        transform(path, data, ...args),
      );
      return acceptor.accept(path, transformed, ...args);
    },
    finalize: acceptor.finalize,
  };
}
