import { existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";
import type { PacksConfig } from "../config.js";
import { getConfig } from "../config.js";
import { createLogger, silentLogger, type Logger } from "../logger.js";
import type Options from "../options.js";
import type { FilterOptions } from "../options.js";
import type { PathInfo } from "../util.js";
import { arrayOrSelf, exists, listChildren, orderBy } from "../util.js";
import ArchiveResolver from "./ArchiveResolver.js";
import FolderResolver from "./FolderResolver.js";
import type { Acceptor, IResolver } from "./IResolver.js";

export interface ResolverInfo {
  resolver: IResolver;
  name: string;
}

function tryCreateResolver(
  { path, info }: Omit<PathInfo, "name">,
  options: FilterOptions,
) {
  if (info.isFile() && [".zip", ".jar"].includes(extname(path)))
    return new ArchiveResolver(path, options);
  if (info.isDirectory()) return new FolderResolver(path, options);
  return null;
}

type SingleOptions = Omit<Options, "from"> & {
  from: string;
};

export function createResolver(options: SingleOptions) {
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

type MergeOptions = Omit<Options, "from"> & { async?: boolean };

export function mergeResolvers(
  resolvers: Array<IResolver | ResolverInfo>,
  options: MergeOptions = {},
): IResolver {
  const runners = resolvers.map((it) => (acceptor: Acceptor) => {
    if ("extract" in it) return it.extract(acceptor);
    loggerOf(options).info(it.name);
    return it.resolver.extract(acceptor);
  });

  return {
    extract: async (acceptor) => {
      if (options?.async !== false) {
        await Promise.all(runners.map((run) => run(acceptor)));
      } else {
        for (const run of runners) {
          await run(acceptor);
        }
      }
    },
  };
}

export function createResolvers(options: Options, config?: PacksConfig) {
  const resolvers = arrayOrSelf(options.from).flatMap((from) =>
    createResolversFor(options, from, config),
  );
  loggerOf(options).info(`Found ${resolvers.length} resource/data packs`);
  return resolvers;
}

export function createMergedResolver(
  options: Options & { async?: boolean },
  config?: PacksConfig,
) {
  const resolvers = createResolvers(options, config);
  return mergeResolvers(resolvers, {
    ...options,
    logger: loggerOf(options).group(),
  });
}

function loggerOf(options: Pick<Options, "logger">): Logger {
  if (options.logger === false) return silentLogger();
  return options.logger ?? createLogger();
}
