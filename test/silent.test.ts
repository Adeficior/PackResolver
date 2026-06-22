import { expect, it, mock } from "bun:test";
import { createTestAcceptor, createTestResolver } from "../src/testing";

it("does not log to console with silent option", async () => {
  console.log = mock();

  const resolver = createTestResolver("folder", { silent: true });
  const acceptor = createTestAcceptor();

  await resolver.extract(acceptor);

  expect(console.log).not.toHaveBeenCalled();
});
