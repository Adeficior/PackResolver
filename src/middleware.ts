import { type Acceptor, type DataConsumer } from "./acceptor";

export function afterFinalize<Data, Args extends unknown[]>(
  acceptor: Acceptor<Data, Args>,
  finalize: NonNullable<Acceptor<Data, Args>["finalize"]>,
): Acceptor<Data, Args> {
  return {
    accept: acceptor.accept.bind(acceptor),
    finalize: async (...args) => {
      if (acceptor.finalize) await acceptor.finalize(...args);
      await finalize(...args);
    },
  };
}

export type DataTransformer<Data, Args extends unknown[]> = (
  ...args: Parameters<DataConsumer<Data, Args>>
) => Promise<Data | false> | Data | false;

export function transformData<Data, Args extends unknown[]>(
  acceptor: Acceptor<Data, Args>,
  transform: DataTransformer<Data, Args>,
): Acceptor<Data, Args> {
  return {
    accept: async (path, data, ...args) => {
      const transformed = await transform(path, data, ...args);
      if (transformed === false) return false;
      return acceptor.accept(path, Promise.resolve(transformed), ...args);
    },
    finalize: acceptor.finalize?.bind(acceptor),
  };
}

export function supplyArguments<
  Data,
  IArgs extends unknown[],
  OArgs extends unknown[],
>(
  acceptor: Acceptor<Data, [...IArgs, ...OArgs]>,
  oArgs: OArgs,
): Acceptor<Data, IArgs> {
  return {
    accept: async (...iArgs) => acceptor.accept(...iArgs, ...oArgs),
    finalize: (...iArgs) => acceptor.finalize?.(...iArgs, ...oArgs),
  };
}
