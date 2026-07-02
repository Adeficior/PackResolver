import { mock, type Mock } from "bun:test";
import type { Logger } from "../logger.js";

export interface TestLogger extends Logger {
  reset(): void;
  info: Mock<Logger["info"]>;
  warn: Mock<Logger["warn"]>;
  error: Mock<Logger["error"]>;
  trace: Mock<Logger["error"]>;
  debug: Mock<Logger["error"]>;
}

export function createTestLogger(): TestLogger {
  const error = mock<Logger["error"]>();
  const info = mock<Logger["info"]>();
  const warn = mock<Logger["warn"]>();
  const debug = mock<Logger["debug"]>();
  const trace = mock<Logger["trace"]>();
  return {
    error,
    info,
    warn,
    trace,
    debug,
    reset: () => {
      info.mockReset();
      warn.mockReset();
      error.mockReset();
      debug.mockReset();
      trace.mockReset();
    },
  };
}
