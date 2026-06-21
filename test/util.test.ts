import { describe, expect, it } from "bun:test";
import { orderBy } from "../src";

describe("utils", () => {
  it("orderBy sorts strings correctly", () => {
    const sorted = orderBy(
      [
        { value: "whatever" },
        { value: "other" },
        { value: "abracadabra" },
        { value: "something else" },
      ],
      (it) => it.value,
    );

    expect(sorted).toMatchObject([
      { value: "abracadabra" },
      { value: "other" },
      { value: "something else" },
      { value: "whatever" },
    ]);
  });

  it("orderBy sorts numbers correctly", () => {
    const sorted = orderBy(
      [{ value: 1 }, { value: 121 }, { value: 43 }, { value: 13.1 }],
      (it) => it.value,
    );

    expect(sorted).toMatchObject([
      { value: 1 },
      { value: 13.1 },
      { value: 43 },
      { value: 121 },
    ]);
  });
});
