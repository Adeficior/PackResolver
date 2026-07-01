import { describe, expect, it, mock } from "bun:test";
import {
  afterFinalize,
  combineResolvers,
  distributedAcceptor,
  type Acceptor,
} from "../src";
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

    const otherFinalize = mock();

    const resolver = filterResolver(
      combineResolvers(
        [
          combineResolvers([
            createTestResolver({
              "path/one": "data",
              "path/two": "data",
            }),
          ]),
        ],
        { async: true },
      ),
      () => true,
    );

    await resolver.extract(
      afterFinalize(
        distributedAcceptor({
          "**": filterAcceptor(acceptor, () => true),
        }),
        otherFinalize,
      ),
    );

    expect(acceptor.finalizeMock).toBeCalledTimes(1);
    expect(otherFinalize).toBeCalledTimes(1);
    expect(acceptor.acceptMock).toHaveBeenCalledWith("path/one");
    expect(acceptor.acceptMock).toHaveBeenCalledWith("path/two");
  });
});
