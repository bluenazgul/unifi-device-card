import { createHash } from "node:crypto";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { extractReleaseNotes } from "./release-notes.mjs";

export function normalizeDevVersion(input) {
  const raw = String(input ?? "").trim().replace(/^v/, "").replace(/-dev$/, "");
  const match = raw.match(/^(\d+\.\d+\.\d+)[a-zA-Z0-9-]*$/);
  if (!match) throw new Error("Dev version must look like 1.0.5, v1.0.5 or 1.0.5b2.");
  return { baseVersion: match[1], tag: `v${raw}-dev` };
}

export function prepareDevRelease(changelog, input) {
  const version = normalizeDevVersion(input);
  const notes = extractReleaseNotes(changelog, version.baseVersion);
  if (!notes) throw new Error(`Missing changelog notes for v${version.baseVersion}; add them before creating a dev release.`);
  return { ...version, notes };
}

export function describeDevBuild(bundle, tag, sourceSha, repositoryUrl) {
  const version = String(tag).replace(/^v/, "");
  const text = bundle.toString("utf8");
  if (!text.startsWith(`/* UniFi Device Card ${version} */\n`) ||
      !text.includes(`var VERSION = ${JSON.stringify(version)};`)) {
    throw new Error(`The generated bundle does not contain the requested version ${version}.`);
  }
  if (!/^[a-f0-9]{40}$/i.test(sourceSha)) throw new Error("A full source commit SHA is required.");

  const sha256 = createHash("sha256").update(bundle).digest("hex");
  const markdown = `### Build provenance

- Source branch: [\`develop\`](${repositoryUrl}/tree/develop)
- Source commit: [\`${sourceSha}\`](${repositoryUrl}/commit/${sourceSha})
- Bundle: \`unifi-device-card.js\` (version \`${version}\`)
- SHA-256: \`${sha256}\`
`;
  return { sha256, markdown };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  if (command === "prepare") {
    const [input, notesPath] = args;
    if (!notesPath || !process.env.GITHUB_ENV || !process.env.GITHUB_OUTPUT) {
      throw new Error("Usage: dev-release.mjs prepare VERSION NOTES_PATH (requires GITHUB_ENV and GITHUB_OUTPUT)");
    }
    const { baseVersion, tag, notes } = prepareDevRelease(readFileSync("CHANGELOG.md", "utf8"), input);
    writeFileSync(notesPath, `${notes}\n`);
    appendFileSync(process.env.GITHUB_ENV, `BASE_VERSION=${baseVersion}\nVERSION=${tag}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `notes_file=${notesPath}\n`);
  } else if (command === "describe") {
    const [notesPath] = args;
    if (!notesPath || !process.env.VERSION || !process.env.GITHUB_REPOSITORY) {
      throw new Error("Usage: dev-release.mjs describe NOTES_PATH (requires VERSION, SOURCE_SHA and GITHUB_REPOSITORY)");
    }
    const { sha256, markdown } = describeDevBuild(
      readFileSync("dist/unifi-device-card.js"), process.env.VERSION, process.env.SOURCE_SHA,
      `${process.env.GITHUB_SERVER_URL || "https://github.com"}/${process.env.GITHUB_REPOSITORY}`
    );
    appendFileSync(notesPath, `\n${markdown}`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
    console.log(`Built ${process.env.VERSION} from develop@${process.env.SOURCE_SHA}; SHA-256: ${sha256}`);
  } else {
    throw new Error("Expected dev-release.mjs prepare or describe.");
  }
}
