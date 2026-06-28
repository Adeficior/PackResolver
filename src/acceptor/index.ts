export type Acceptable = string | NodeJS.ArrayBufferView;

export interface Acceptor<T = Acceptable> {
  accept(path: string, content: T): void | false | Promise<void | false>;
  finalize?: () => void | Promise<void>;
}
