import type { Acceptable, Acceptor, DataConsumer } from "../acceptor/index.js";

export type ResolverRunner<T = Acceptable> = (
  acceptor: Acceptor<T>,
) => Promise<void> | void;

export interface Resolver<T = Acceptable> {
  extract: ResolverRunner<T>;
}

export abstract class AbstractResolver implements Resolver {
  public readonly extract: ResolverRunner<Acceptable> = async ({
    accept,
    finalize,
  }) => {
    await this.supply(accept);
    if (finalize) await finalize();
  };

  protected abstract supply(acceptor: DataConsumer): Promise<void> | void;
}
