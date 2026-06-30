import type { Acceptor } from "./acceptor";

export function afterAcceptor<T>(
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
