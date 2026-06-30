import { extname } from "node:path";
import type { Acceptor } from ".";
import { writeToArchive } from "./archive";
import { writeToFolder } from "./folder";

export function createAcceptor(path: string): Acceptor {
  if ([".zip", ".jar"].includes(extname(path))) return writeToArchive(path);
  return writeToFolder(path);
}
