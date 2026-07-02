import type { Resolver, ResolverRunner } from ".";
import type { DataConsumer } from "../acceptor";
import { extendContext, type ContextLike } from "../context";

export type DataConsumerWithoutContext<Data> = (
  path: string,
  content: PromiseLike<Data>,
) => ReturnType<DataConsumer<Data>>;

export abstract class AbstractResolver<
  Data,
  Context extends ContextLike,
> implements Resolver<Data, Context> {
  constructor(private readonly context: Context) {}

  public readonly extract: ResolverRunner<Data, Context> = async (acceptor) => {
    await this.supply((path, ...args) =>
      acceptor.accept(path, ...args, extendContext(this.context, { path })),
    );
    if (acceptor.finalize) await acceptor.finalize();
  };

  protected abstract supply(
    acceptor: DataConsumerWithoutContext<Data>,
  ): Promise<void> | void;
}
