import { describe, expect, it } from "bun:test";
import { createTestAcceptor } from "../src/testing";
import createResourcesResolver from "./resources";

describe("archives", () => {
  it("is able to extract files from archives", async () => {
    const resolver = createResourcesResolver("archive.jar");
    const acceptor = createTestAcceptor();

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(8254);
  });
});
