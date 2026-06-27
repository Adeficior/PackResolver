import type { Logger } from "./logger";

export interface FilterOptions {
  exclude?: string | string[];
  include?: string | string[];
}

export default interface Options extends FilterOptions {
  from: string;
  logger?: Logger | false;
}
