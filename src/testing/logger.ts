import { mock, type Mock } from "bun:test";
import type { Logger } from "../logger.js";

export interface TestLogger extends Logger {
  reset(): void;
  info: Mock<Logger["info"]>;
  warn: Mock<Logger["warn"]>;
  error: Mock<Logger["error"]>;
}

export function createTestLogger(): TestLogger {
  const error = mock<Logger["error"]>();
  const info = mock<Logger["info"]>();
  const warn = mock<Logger["warn"]>();
  return {
    error,
    info,
    warn,
    reset: () => {
      info.mockReset();
      warn.mockReset();
      error.mockReset();
    },
  };
}
