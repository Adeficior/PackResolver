import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createLogger, silentLogger } from "../src/index.js";
import { createTestAcceptor } from "../src/testing/acceptor.js";
import { createTestResolver } from "../src/testing/resolver.js";

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

    const error = new Error("the message");
    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured", error);

    expect(console.info).toHaveBeenCalledWith("Info Test");
    expect(console.warn).toHaveBeenCalledWith("Some Warning");
    expect(console.error).toHaveBeenCalledWith("An Error Occured", error);
  });

  it("grouped logger prefixes spaces", () => {
    const logger = createUncoloredLogger();

    logger.info("Before");

    const prefixed = logger.group();

    const error = new Error("the message");
    prefixed.info("Info Test");
    prefixed.warn("Some Warning");
    prefixed.error("An Error Occured", error);

    logger.info("After");

    expect(console.info).toHaveBeenCalledWith("Before");
    expect(console.info).toHaveBeenCalledWith("After");
    expect(console.info).toHaveBeenCalledWith("   Info Test");
    expect(console.warn).toHaveBeenCalledWith("   Some Warning");
    expect(console.error).toHaveBeenCalledWith("   An Error Occured", error);
  });

  it("grouped logger adds prefix", () => {
    const logger = createUncoloredLogger().group("prefix");

    const error = new Error("the message");
    logger.info("Info Test");
    logger.warn("Some Warning");
    logger.error("An Error Occured", error);

    expect(console.info).toHaveBeenCalledWith("prefix -> Info Test");
    expect(console.warn).toHaveBeenCalledWith("prefix -> Some Warning");
    expect(console.error).toHaveBeenCalledWith(
      "prefix -> An Error Occured",
      error,
    );
  });
});

it("does not log to console with silent option", async () => {
  console.log = mock();

  const resolver = createTestResolver("folder", { logger: silentLogger() });
  const acceptor = createTestAcceptor();

  await resolver.extract(acceptor);

  expect(console.log).not.toHaveBeenCalled();
});
