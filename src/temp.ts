import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type TempDir = {
  path: string;
  removeCallback?: () => void;
};

export default function createTempDir() {
  const path = mkdtempSync(join(tmpdir(), "merger-"));
  const removeCallback = () => rmSync(path, { recursive: true, force: true });
  return { path, removeCallback };
}
