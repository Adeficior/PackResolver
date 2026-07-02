import { styleText, type InspectColor } from "node:util";
import type { ContextLike } from "./context";

type Logable = string | number | boolean | null | undefined;
type LogMethod = (message: Logable, context?: ContextLike) => void;

export type Logger = {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  trace: LogMethod;
};

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
  return {
    /* eslint-disable no-console */
    info: styled(console.info, "green", options),
    warn: styled(console.warn, "yellow", options),
    error: styled(console.error, "red", options),
    debug: styled(console.debug, "blue", options),
    trace: styled(console.trace, "red", options),
    /* eslint-enable no-console */
  };
}

const silent: LogMethod = () => {};
export function silentLogger(): Logger {
  return {
    info: silent,
    warn: silent,
    error: silent,
    debug: silent,
    trace: silent,
  };
}

export function extendLoggerContext(
  logger: Logger,
  additional: ContextLike,
): Logger {
  return {
    info: (message, context = {}) =>
      logger.info(message, { ...context, ...additional }),
    error: (message, context = {}) =>
      logger.error(message, { ...context, ...additional }),
    warn: (message, context = {}) =>
      logger.warn(message, { ...context, ...additional }),
    debug: (message, context = {}) =>
      logger.debug(message, { ...context, ...additional }),
    trace: (message, context = {}) =>
      logger.trace(message, { ...context, ...additional }),
  };
}
