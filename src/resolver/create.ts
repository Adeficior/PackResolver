import { existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";
import type { PacksConfig } from "../config.js";
import { getConfig } from "../config.js";
import { filterResolver } from "../filter.js";
import { createLogger, silentLogger, type Logger } from "../logger.js";
import type Options from "../options.js";
import type { FilterOptions } from "../options.js";
import type { PathInfo } from "../util.js";
import { arrayOrSelf, exists, listChildren, orderBy } from "../util.js";
import ArchiveResolver from "./archive.js";
import FolderResolver from "./folder.js";
import type { Resolver } from "./index.js";

export interface ResolverInfo {
  resolver: Resolver;
  name: string;
}

function createUnfilteredResolver({ path, info }: Omit<PathInfo, "name">) {
  if (info.isFile() && [".zip", ".jar"].includes(extname(path)))
    return new ArchiveResolver(path);
  if (info.isDirectory()) return new FolderResolver(path);
  return null;
}

function tryCreateResolver(
  info: Omit<PathInfo, "name">,
  options: FilterOptions,
) {
  const unfiltered = createUnfilteredResolver(info);
  if (unfiltered) return filterResolver(unfiltered, options);
  return null;
}

export function createResolver(options: Options) {
  const path = options.from;
  const info = statSync(path);
  const resolver = tryCreateResolver({ path, info }, options);

  if (!resolver) {
    throw new Error(`unable to create resolver for ${path}`);
  }

  return resolver;
}

function createResolversFor(
  options: Omit<Options, "from">,
  from: string,
  config: PacksConfig = getConfig(from),
): ResolverInfo[] {
  if (!existsSync(from)) {
    throw new Error(`input directory not found: ${resolve(from)}`);
  }

  const packs = listChildren(from)
    .map((it) => ({ ...it, config: config.packs[it.name] }))
    .filter((it) => !it.config?.disabled);

  const resolvers = orderBy(packs, (it) => it.config?.priority ?? 0)
    .flatMap(({ config, name, path, info }) => {
      const paths = arrayOrSelf(config?.paths ?? ".");
      return paths.map((suffix) => {
        const resolver = tryCreateResolver(
          { path: join(path, suffix), info },
          options,
        );
        return resolver && { resolver, name };
      });
    })
    .filter(exists);

  return resolvers;
}
export function createResolvers(options: Options, config?: PacksConfig) {
  const resolvers = arrayOrSelf(options.from).flatMap((from) =>
    createResolversFor(options, from, config),
  );
  loggerOf(options).info(`Found ${resolvers.length} resource/data packs`);
  return resolvers;
}

function loggerOf(options: Pick<Options, "logger">): Logger {
  if (options.logger === false) return silentLogger();
  return options.logger ?? createLogger();
}
