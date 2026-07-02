import type { Resolver, ResolverRunner } from ".";
import type { DataConsumer } from "../acceptor";

export abstract class AbstractResolver<Data> implements Resolver<Data> {
  public readonly extract: ResolverRunner<Data> = async (acceptor) => {
    await this.supply(acceptor.accept.bind(acceptor));
    if (acceptor.finalize) await acceptor.finalize();
  };

  protected abstract supply(
    acceptor: DataConsumer<Data, []>,
  ): Promise<void> | void;
}
