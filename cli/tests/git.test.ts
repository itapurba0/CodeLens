import { describe, it, expect } from "vitest";
import { chunkDiff } from "../src/git.js";

describe("chunkDiff", () => {
  it("splits diff into per-file chunks with line prefixes", () => {
    const raw = `diff --git a/src/foo.ts b/src/foo.ts
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -1,3 +1,4 @@
 import { bar } from './bar';
+import { baz } from './baz';
 
 export function foo() {`;

    const chunks = chunkDiff(raw);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].file_path).toBe("src/foo.ts");
    expect(chunks[0].chunk_index).toBe(0);
    expect(chunks[0].content).toContain("import");
  });

  it("returns empty array for empty diff", () => {
    const chunks = chunkDiff("");
    expect(chunks).toEqual([]);
  });

  it("handles multiple files", () => {
    const raw = `diff --git a/a.ts b/a.ts
--- a/a.ts
+++ b/a.ts
@@ -1 +1,2 @@
+added line
 
diff --git a/b.ts b/b.ts
--- a/b.ts
+++ b/b.ts
@@ -1 +1,2 @@
+another line`;
    const chunks = chunkDiff(raw);
    expect(chunks.length).toBe(2);
    expect(chunks[0].file_path).toBe("a.ts");
    expect(chunks[1].file_path).toBe("b.ts");
  });
});
