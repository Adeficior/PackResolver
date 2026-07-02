import type { Logger } from "../logger";

export type Acceptable = string | NodeJS.ArrayBufferView;

export type DataConsumer<Data = Acceptable, Args extends unknown[] = []> = (
  path: string,
  content: PromiseLike<Data>,
  logger: Logger,
  ...args: Args
) => void | false | Promise<void | false>;

export interface Acceptor<Data = Acceptable, Args extends unknown[] = []> {
  accept: DataConsumer<Data, Args>;
  finalize?: (...args: Args) => void | Promise<void>;
}

export function simpleAcceptor<Data = Acceptable, Args extends unknown[] = []>(
  accept: DataConsumer<Data, Args>,
): Acceptor<Data, Args> {
  return { accept };
}
