import type { Resolver, ResolverRunner } from ".";
import type { Acceptable, DataConsumer } from "../acceptor";

export abstract class AbstractResolver implements Resolver {
  public readonly extract: ResolverRunner<Acceptable> = async (acceptor) => {
    await this.supply(acceptor.accept.bind(acceptor));
    if (acceptor.finalize) await acceptor.finalize();
  };

  protected abstract supply(acceptor: DataConsumer): Promise<void> | void;
}
