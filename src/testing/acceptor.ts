import type { Acceptor } from "../index.js";

export interface TestAcceptor extends Acceptor {
  at(path: string): string | null;

  paths(): string[];

  jsonAt(path: string): string | null;
}

export function createTestAcceptor(): TestAcceptor {
  const received = new Map<string, string>();

  const accept: TestAcceptor["accept"] = (path, content) => {
    received.set(path, content.toString());
  };

  const paths: TestAcceptor["paths"] = () => [...received.keys()].sort();

  const at: TestAcceptor["at"] = (path) => received.get(path) ?? null;
  const jsonAt: TestAcceptor["jsonAt"] = (path) => {
    const raw = at(path);
    return raw && JSON.parse(raw);
  };

  return { accept, paths, at, jsonAt };
}
