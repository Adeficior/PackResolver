import { existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";
import type { Acceptable } from "../acceptor/index.js";
import type { PacksConfig } from "../config.js";
import { getConfig } from "../config.js";
import { type BaseContext, type ContextLike } from "../context.js";
import { filterResolver } from "../filter.js";
import { createLogger, silentLogger, type Logger } from "../logger.js";
import type {
  CombinedResolverOptions,
  FilterOptions,
  ResolverOptions,
} from "../options.js";
import type { PathInfo } from "../util.js";
import { arrayOrSelf, exists, listChildren, orderBy } from "../util.js";
import ArchiveResolver from "./archive.js";
import FolderResolver from "./folder.js";
import type { Resolver } from "./index.js";

function createUnfilteredResolver<Context extends ContextLike>(
  { path, info }: Omit<PathInfo, "name">,
  context: Context,
) {
  if (info.isFile() && [".zip", ".jar"].includes(extname(path)))
    return new ArchiveResolver(path, context);
  if (info.isDirectory()) return new FolderResolver(path, context);
  return null;
}

function tryCreateResolver<Context extends ContextLike>(
  info: Omit<PathInfo, "name">,
  options: FilterOptions,
  context: Context,
) {
  const unfiltered = createUnfilteredResolver<Context>(info, context);
  if (unfiltered) return filterResolver(unfiltered, options);
  return null;
}

export function createResolver(
  options: ResolverOptions,
): Resolver<Acceptable, BaseContext> {
  const path = options.from;
  const info = statSync(path);
  const resolver = tryCreateResolver({ path, info }, options, {
    logger: loggerOf(options),
  });

  if (!resolver) {
    throw new Error(`unable to create resolver for ${path}`);
  }

  return resolver;
}

function createResolversFor<Context extends ContextLike>(
  options: Omit<ResolverOptions, "from">,
  from: string,
  context: Context,
  config: PacksConfig = getConfig(from),
): Resolver<Acceptable, Context & { source: string }>[] {
  if (!existsSync(from)) {
    throw new Error(`input directory not found: ${resolve(from)}`);
  }

  const packs = listChildren(from)
    .map((it) => ({ ...it, config: config.packs[it.name] }))
    .filter((it) => !it.config?.disabled);

  const resolvers = orderBy(packs, (it) => it.config?.priority ?? 0)
    .flatMap(({ config, path, info }) => {
      const paths = arrayOrSelf(config?.paths ?? ".");
      return paths.map((suffix) => {
        const resolver = tryCreateResolver(
          { path: join(path, suffix), info },
          options,
          context,
        );

        return resolver;
      });
    })
    .filter(exists);

  return resolvers;
}
export function createResolvers(
  options: CombinedResolverOptions,
  config?: PacksConfig,
) {
  const logger = loggerOf(options);
  const context: BaseContext = { logger };
  const resolvers = arrayOrSelf(options.from).flatMap((from) =>
    createResolversFor(options, from, context, config),
  );
  logger.info(`Found ${resolvers.length} resource/data packs`);
  return resolvers;
}

export function loggerOf(options: Pick<ResolverOptions, "logger">): Logger {
  if (options.logger === false) return silentLogger();
  return options.logger ?? createLogger();
}
