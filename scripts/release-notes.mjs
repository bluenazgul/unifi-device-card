import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function extractReleaseNotes(changelog, version) {
  const target = String(version).replace(/^v/, "");
  const lines = changelog.split(/\r?\n/);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^##\s+(.+?)\s*$/);
    if (!heading) continue;
    if (start !== -1) return lines.slice(start, index).join("\n").trim();
    const headingVersion = heading[1].replace(/^\[(.*?)\]$/, "$1").replace(/^v/, "");
    if (headingVersion === target) start = index + 1;
  }
  return start === -1 ? "" : lines.slice(start).join("\n").trim();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [version, outputPath] = process.argv.slice(2);
  if (!version || !outputPath) {
    throw new Error("Usage: node scripts/release-notes.mjs VERSION OUTPUT_PATH");
  }
  const notes = extractReleaseNotes(readFileSync("CHANGELOG.md", "utf8"), version);
  writeFileSync(outputPath, `${notes || "See CHANGELOG.md for details."}\n`);
}
