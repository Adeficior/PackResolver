import type { Acceptable } from "../resolver";
import { ReducingStrategy } from "./reducing";

export class KeepingStrategy extends ReducingStrategy {
  protected override mergeData(previous: Acceptable): Acceptable {
    return previous;
  }
}
