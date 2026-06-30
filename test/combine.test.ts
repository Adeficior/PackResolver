import { describe, expect, it } from "bun:test";
import { combineResolvers } from "../src";
import { createTestAcceptor } from "../src/testing";
import createResourcesResolver from "./resources";

describe("combined resolvers", () => {
  it("only calls finalize once on the acceptor", async () => {
    const acceptor = createTestAcceptor();

    const resolver = combineResolvers([
      createResourcesResolver("folder"),
      createResourcesResolver("archive.jar"),
    ]);

    await resolver.extract(acceptor);

    expect(acceptor.finalize).toBeCalledTimes(1);
  });
});
