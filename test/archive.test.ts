import { describe, expect, it } from "bun:test";
import { createTestAcceptor, createTestResolver } from "../src/testing";

describe("archives", () => {
  it("is able to extract files from archives", async () => {
    const resolver = createTestResolver("archive");
    const acceptor = createTestAcceptor();

    await resolver.extract(acceptor);

    expect(acceptor.paths()).toHaveLength(8254);
  });
});
