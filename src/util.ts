import crypto from "crypto";
import type { Stats } from "fs";
import { readdirSync, statSync } from "fs";
import { join } from "path/posix";

export function exists<T>(value?: T | null): value is T {
  return (value ?? null) !== null;
}

export interface PathInfo {
  path: string;
  name: string;
  info: Stats;
}

export function listChildren(dir: string): PathInfo[] {
  const unsorted = readdirSync(dir).map((name) => {
    const path = join(dir, name);
    const info = statSync(path);
    return { name, path, info };
  });
  return orderBy(unsorted, (it) => it.name);
}

export function fileHash(content: Buffer, type = "sha256") {
  return crypto.createHash(type).update(content).digest("hex");
}

export function arrayOrSelf<T>(value?: T | T[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

type Comparable = string | number;

export function orderBy<T, C extends Comparable>(
  array: T[],
  selector: (value: T) => C,
) {
  return array.toSorted((a, b) => {
    const [va, vb] = [a, b].map(selector) as [C, C];
    return va > vb ? 1 : -1;
  });
}
