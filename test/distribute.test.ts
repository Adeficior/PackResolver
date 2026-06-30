import { describe, expect, it } from "bun:test";
import { distributedAcceptor } from "../src";
import { createTestAcceptor } from "../src/testing";
import createResourcesResolver from "./resources";

describe("distributed acceptor", () => {
  it("only calls finalize once per acceptor", async () => {
    const dataAcceptor = createTestAcceptor();

    const acceptor = distributedAcceptor({
      "data/**": dataAcceptor,
      "assets/**": dataAcceptor,
    });

    const resolver = createResourcesResolver("archive.jar");

    await resolver.extract(acceptor);

    expect(dataAcceptor.finalize).toBeCalledTimes(1);
  });
});
