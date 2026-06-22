import { mock, type Mock } from "bun:test";
import type { Logger } from "../logger.js";
import { wrapLogMethods } from "../logger.js";

export interface TestLogger extends Logger {
  reset(): void;
  info: Mock<Logger["info"]>;
  warn: Mock<Logger["warn"]>;
  error: Mock<Logger["error"]>;
}

export function createTestLogger(): TestLogger {
  const logger = wrapLogMethods({
    error: mock(),
    warn: mock(),
    info: mock(),
  }) as TestLogger;

  logger.reset = () => {
    logger.info.mockReset();
    logger.warn.mockReset();
    logger.error.mockReset();
  };

  return logger;
}
