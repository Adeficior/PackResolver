import { mkdtempSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type TempDir = {
  path: string;
  removeCallback?: () => void;
};

export default function createTempDir() {
  const path = mkdtempSync(join(tmpdir(), "merger-"));
  const removeCallback = () => rmdirSync(path);
  return { path, removeCallback };
}
