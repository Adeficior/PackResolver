import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import type { Acceptable, Acceptor } from "./acceptor";
import type { ContextLike } from "./context";
import { filterAcceptor } from "./filter";
import { afterFinalize } from "./middleware";

function parseCacheFile(path: string) {
  const map = new Map<string, string>();
  const seperator = " ";

  if (existsSync(path)) {
    readFileSync(path)
      .toString()
      .split("\n")
      .map((it) => it.trim())
      .filter((it) => it.includes(seperator))
      .map((it) => it.split(seperator) as [string, string])
      .forEach(([path, hash]) => {
        map.set(path, hash);
      });
  }

  return map;
}

function createHash(content: Acceptable): string {
  const hash = crypto.createHash("md5");
  hash.setEncoding("hex");
  hash.write(content);
  hash.end();
  return hash.read();
}

export function cachedAcceptor<Context extends ContextLike>(
  acceptor: Acceptor<Acceptable, Context>,
  cacheFile: string,
  cleanup?: (orphans: string[]) => Promise<void>,
): Acceptor<Acceptable, Context> {
  const lastCache = parseCacheFile(cacheFile);
  const nextCache = new Map<string, string>();

  const orphans = () => {
    return [...lastCache.keys()].filter((it) => !nextCache.has(it));
  };

  const filtered = filterAcceptor(acceptor, async (path, data) => {
    const content = await data;
    const hash = createHash(content);
    nextCache.set(path, hash);
    return lastCache.get(path) !== hash;
  });

  return afterFinalize(filtered, async () => {
    if (cleanup) await cleanup(orphans());
  });
}
