import { beforeEach, describe, expect, it, mock } from "bun:test";
import { join } from "node:path";
import { supplyResolverContext } from "../src/context.js";
import {
  createLogger,
  extendLoggerContext,
  silentLogger,
  simpleAcceptor,
} from "../src/index.js";
import { createTestAcceptor } from "../src/testing/acceptor.js";
import { createTestLogger } from "../src/testing/logger.js";
import createResourcesResolver from "./resources.js";

/* eslint-disable no-console */

const createUncoloredLogger = () => createLogger({ colored: false });

beforeEach(() => {
  console.info = mock();
  console.warn = mock();
  console.error = mock();
});

describe("tests regarding the logger", () => {
  it("default logger prints console", () => {
    const logger = createUncoloredLogger();

    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured");

    expect(console.info).toHaveBeenCalledWith("Info Test");
    expect(console.warn).toHaveBeenCalledWith("Some Warning");
    expect(console.error).toHaveBeenCalledWith("An Error Occured");
  });

  it("grouped logger adds context", () => {
    const context = {
      what: "test",
    };
    const logger = extendLoggerContext(createUncoloredLogger(), context);

    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured");

    expect(console.info).toHaveBeenCalledWith("Info Test", context);
    expect(console.warn).toHaveBeenCalledWith("Some Warning", context);
    expect(console.error).toHaveBeenCalledWith("An Error Occured", context);
  });
});

it("does not log to console with silent option", async () => {
  console.info = mock();

  const resolver = createResourcesResolver("folder", {
    logger: silentLogger(),
  });
  const acceptor = createTestAcceptor();

  await resolver.extract(acceptor);

  expect(console.info).not.toHaveBeenCalled();
});

it("gets context from resolver", async () => {
  const logger = createTestLogger();
  const resolver = createResourcesResolver("folder", { logger });
  const acceptor = simpleAcceptor((_path, _data, context) => {
    context.logger.info("received");
  });

  await resolver.extract(acceptor);

  expect(logger.info).toBeCalledWith(
    "received",
    expect.objectContaining({
      source: join("test", "resources", "folder"),
    }),
  );
});

it("gets additional context from resolver", async () => {
  const logger = createTestLogger();
  const resolver = createResourcesResolver("folder", { logger });
  const acceptor = simpleAcceptor((_path, _data, context) => {
    context.logger.info("received");
  });

  const context = { key: "value" };
  await supplyResolverContext(resolver, context).extract(acceptor);

  expect(logger.info).toBeCalledWith(
    "received",
    expect.objectContaining({
      ...context,
      source: join("test", "resources", "folder"),
    }),
  );
});
