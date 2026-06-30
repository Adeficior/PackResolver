export type Acceptable = string | NodeJS.ArrayBufferView;

export type DataConsumer<T = Acceptable> = (
  path: string,
  content: PromiseLike<T>,
) => void | false | Promise<void | false>;

export interface Acceptor<T = Acceptable> {
  accept: DataConsumer<T>;
  finalize?: () => void | Promise<void>;
}

export function simpleAcceptor(accept: DataConsumer): Acceptor {
  return { accept };
}
