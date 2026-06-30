import type { Resolver, ResolverRunner } from ".";
import type { Acceptable, DataConsumer } from "../acceptor";

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
