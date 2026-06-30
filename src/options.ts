import type { Logger } from "./logger";

export interface FilterOptions {
  exclude?: string | string[];
  include?: string | string[];
}

export interface ResolverOptions extends FilterOptions {
  from: string;
  logger?: Logger | false;
}

export interface CombinedResolverOptions extends FilterOptions {
  from: string[] | string;
  logger?: Logger | false;
}
