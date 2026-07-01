import { describe, expect, it, mock } from "bun:test";
import { combineResolvers, distributedAcceptor, type Acceptor } from "../src";
import { filterAcceptor, filterResolver } from "../src/filter";
import { createTestResolver } from "../src/testing";

class AcceptorClass implements Acceptor {
  readonly finalizeMock = mock();
  readonly acceptMock = mock();

  async accept(path: string) {
    this.acceptMock(path);
  }

  async finalize() {
    this.finalizeMock();
  }
}

describe("general tests regarding the acceptor/resolver flows", () => {
  it("keeps this context", async () => {
    const acceptor = new AcceptorClass();

    const resolver = filterResolver(
      combineResolvers([
        createTestResolver({
          "path/one": "data",
          "path/two": "data",
        }),
      ]),
      () => true,
    );

    await resolver.extract(
      distributedAcceptor({
        "**": filterAcceptor(acceptor, () => true),
      }),
    );

    expect(acceptor.finalizeMock).toBeCalledTimes(1);
    expect(acceptor.acceptMock).toHaveBeenCalledWith("path/one");
    expect(acceptor.acceptMock).toHaveBeenCalledWith("path/two");
  });
});
