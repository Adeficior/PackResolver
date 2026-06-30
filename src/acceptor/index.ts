export type Acceptable = string | NodeJS.ArrayBufferView;

export interface Acceptor<T = Acceptable> {
  accept(
    path: string,
    content: PromiseLike<T>,
  ): void | false | Promise<void | false>;
  finalize?: () => void | Promise<void>;
}

export function simpleAcceptor(accept: Acceptor["accept"]): Acceptor {
  return { accept };
}
