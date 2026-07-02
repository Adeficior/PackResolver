import { afterEach, describe, expect, it, mock } from "bun:test";
import { simpleAcceptor } from "../src";
import promiseData from "../src/resolver/dataPromise";
import { createTestLogger } from "../src/testing";

const logger = createTestLogger();

afterEach(() => logger.reset());

describe("data promises", () => {
  it("supplies data only once", async () => {
    const acceptor = simpleAcceptor(async (_, data) => {
      await data;
    });

    const supplier = mock(() => Promise.resolve("data"));
    const data = promiseData(supplier);
    await acceptor.accept("test/path", data, { logger });
    await acceptor.accept("test/other-path", data, { logger });

    expect(supplier).toBeCalledTimes(1);
  });

  it("does not call data supplier if not needed", async () => {
    let receivedPath = "";
    const expectedPath = "test/path";

    const acceptor = simpleAcceptor((path) => {
      receivedPath = path;
    });

    const supplier = mock(() => Promise.resolve("data"));
    const data = promiseData(supplier);
    await acceptor.accept(expectedPath, data, { logger });

    expect(receivedPath).toBe(expectedPath);
    expect(supplier).not.toBeCalled();
  });
});
