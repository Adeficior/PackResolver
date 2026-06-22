import { styleText, type InspectColor } from "node:util";

type Logable = string | number | boolean | null | undefined;
type LogMethod = (message: Logable, ...args: unknown[]) => void;

type LogMethods = {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
};

export type Logger = LogMethods & {
  group(prefix?: string): Logger;
};

export function wrapLogMethods(logMethods: LogMethods): Logger {
  return { ...logMethods, group: (prefix) => subLogger(logMethods, prefix) };
}

function grouped(prefix: string | undefined, message: Logable) {
  if (prefix) return `${prefix} -> ${message}`;
  return `   ${message}`;
}

function subLogger(logger: LogMethods, prefix?: string): Logger {
  return wrapLogMethods({
    error: (message, ...args) =>
      logger.error(grouped(prefix, message), ...args),
    warn: (message, ...args) => logger.warn(grouped(prefix, message), ...args),
    info: (message, ...args) => logger.info(grouped(prefix, message), ...args),
  });
}

export type LoggerOptions = {
  colored?: boolean;
};

function styled(
  method: LogMethod,
  style: InspectColor,
  { colored = true }: LoggerOptions,
): LogMethod {
  if (!colored) return method;
  return (msg, ...args) => method(styleText(style, String(msg)), ...args);
}

export function createLogger(options: LoggerOptions = {}): Logger {
  return wrapLogMethods({
    /* eslint-disable no-console */
    info: styled(console.info, "green", options),
    warn: styled(console.warn, "yellow", options),
    error: styled(console.error, "red", options),
    /* eslint-enable no-console */
  });
}

const silent: LogMethod = () => {};
export function silentLogger(): Logger {
  return wrapLogMethods({
    info: silent,
    warn: silent,
    error: silent,
  });
}
