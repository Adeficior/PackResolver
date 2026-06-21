import type { MinimatchOptions } from "minimatch";
import { minimatch } from "minimatch";
import type { FilterOptions } from "./options.js";
import { arrayOrSelf } from "./util.js";

export function createFilter(options: FilterOptions) {
  const include = arrayOrSelf(options.include);
  const exclude = arrayOrSelf(options.exclude);
  return (value: string, options: MinimatchOptions = {}) => {
    if (include?.length)
      return include.some((pattern) => minimatch(value, pattern, options));

    return !exclude.some((pattern) => minimatch(value, pattern, { dot: true }));
  };
}
