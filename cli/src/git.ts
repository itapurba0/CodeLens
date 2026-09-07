import { execa } from "execa";
import type { DiffChunk } from "./types.js";

export async function spawnDiff(): Promise<string> {
  const { stdout } = await execa("git", ["diff", "HEAD", "-U3"]);
  return stdout;
}

export function chunkDiff(raw: string): DiffChunk[] {
  const fileChunks: DiffChunk[] = [];
  const files = raw.split(/^diff --git /m).filter(Boolean);

  for (const file of files) {
    const pathMatch = file.match(/a\/(.+?) b\//);
    const filePath = pathMatch ? pathMatch[1] : "unknown";

    const hunkRegex = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@.*$/gm;
    let match: RegExpExecArray | null;
    const lines = file.split("\n");
    let currentHunkStart = 0;
    let chunkIndex = 0;

    while ((match = hunkRegex.exec(file)) !== null) {
      const hunkLine = match[0];
      const hunkIndex = lines.findIndex(
        (l, i) => i >= currentHunkStart && l.trim() === hunkLine.trim()
      );

      if (hunkIndex === -1) continue;

      const nextHunkMatch = hunkRegex.exec(file);
      hunkRegex.lastIndex = match.index + match[0].length;

      const endLine = nextHunkMatch
        ? lines.findIndex(
            (l, i) =>
              i > hunkIndex && l.trim() === nextHunkMatch[0].trim()
          )
        : lines.length;

      const chunkLines = lines.slice(hunkIndex, endLine === -1 ? lines.length : endLine);
      const absoluteStart = parseInt(match[1], 10);

      const content = chunkLines
        .map((line, i) => {
          if (line.startsWith("+") || line.startsWith("-") || line.startsWith(" ")) {
            return ` ${absoluteStart + i}: ${line}`;
          }
          return line;
        })
        .join("\n");

      fileChunks.push({
        file_path: filePath,
        chunk_index: chunkIndex++,
        content,
      });

      currentHunkStart = endLine === -1 ? lines.length : endLine;
    }

    if (chunkIndex === 0) {
      const content = lines
        .filter((l) => l.startsWith("+") || l.startsWith("-") || l.startsWith(" "))
        .map((l, i) => ` ${i + 1}: ${l}`)
        .join("\n");

      if (content) {
        fileChunks.push({
          file_path: filePath,
          chunk_index: 0,
          content,
        });
      }
    }
  }

  return fileChunks;
}
