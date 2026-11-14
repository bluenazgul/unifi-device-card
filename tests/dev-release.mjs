import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { describeDevBuild, normalizeDevVersion, prepareDevRelease } from "../scripts/dev-release.mjs";

const notes = "### Bug Fixes\nFix Express 7 and port updates.\n\n### Hints\nKeep the support links.";
const changelog = `# Changelog\n\n## [v1.0.5]\n\n${notes}\n\n## [v1.0.4]\nOlder notes.\n`;

for (const input of ["1.0.5", "v1.0.5", "1.0.5b2", "v1.0.5b2", "v1.0.5b2-dev"]) {
  test(`dev version ${input} uses the numeric base changelog and one -dev suffix`, () => {
    const release = prepareDevRelease(changelog, input);
    assert.equal(release.baseVersion, "1.0.5");
    assert.equal(release.tag, input.includes("b2") ? "v1.0.5b2-dev" : "v1.0.5-dev");
    assert.equal(release.notes, notes);
  });
}

test("invalid dev versions and missing base notes stop release preparation", () => {
  for (const input of ["", "1.0", "v1.0.5/branch", "1.0.5\nVERSION=other", "1.0.5;echo bad"]) {
    assert.throws(() => normalizeDevVersion(input), /Dev version must look like/);
  }
  assert.throws(() => prepareDevRelease(changelog, "1.0.6b1"), /Missing changelog notes for v1.0.6/);
  assert.throws(() => prepareDevRelease("## [v1.0.5]\n\n## [v1.0.4]\nOlder notes.", "1.0.5"), /Missing changelog/);
});

test("dev workflow prepares notes, builds from source and records verifiable provenance", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "unifi-dev-release-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const script = fileURLToPath(new URL("../scripts/dev-release.mjs", import.meta.url));
  const build = fileURLToPath(new URL("../build.js", import.meta.url));
  const notesPath = join(cwd, "notes.md");
  const envPath = join(cwd, "env.txt");
  const outputPath = join(cwd, "outputs.txt");
  const summaryPath = join(cwd, "summary.md");
  const env = {
    ...process.env,
    GITHUB_ENV: envPath, GITHUB_OUTPUT: outputPath, GITHUB_STEP_SUMMARY: summaryPath,
    GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "example/card",
    SOURCE_SHA: "0123456789abcdef0123456789abcdef01234567",
  };
  writeFileSync(join(cwd, "CHANGELOG.md"), changelog);
  execFileSync(process.execPath, [script, "prepare", "v1.0.5b2", notesPath], { cwd, env });
  assert.equal(readFileSync(envPath, "utf8"), "BASE_VERSION=1.0.5\nVERSION=v1.0.5b2-dev\n");
  assert.equal(readFileSync(outputPath, "utf8"), `notes_file=${notesPath}\n`);
  assert.equal(readFileSync(notesPath, "utf8"), `${notes}\n`);

  mkdirSync(join(cwd, "src"));
  mkdirSync(join(cwd, "dist"));
  writeFileSync(join(cwd, "src/unifi-device-card.js"), 'const VERSION = __VERSION__; console.log(VERSION, "fresh-source");\n');
  const bundlePath = join(cwd, "dist/unifi-device-card.js");
  writeFileSync(bundlePath, "stale bundle");
  const buildEnv = { ...env, VERSION: "v1.0.5b2-dev", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF_NAME: "develop" };
  execFileSync(process.execPath, [build], { cwd, env: buildEnv });
  const bundle = readFileSync(bundlePath);
  assert.match(bundle.toString(), /fresh-source/);
  execFileSync(process.execPath, [script, "describe", notesPath], { cwd, env: buildEnv });
  const releaseNotes = readFileSync(notesPath, "utf8");
  assert.ok(releaseNotes.startsWith(`${notes}\n`), "existing changelog and Hints content is preserved");
  assert.ok(releaseNotes.includes(`https://github.com/example/card/commit/${env.SOURCE_SHA}`));
  assert.match(releaseNotes, /Source branch: \[`develop`\]/);
  assert.match(releaseNotes, /1\.0\.5b2-dev/);
  const checksum = createHash("sha256").update(readFileSync(bundlePath)).digest("hex");
  assert.ok(releaseNotes.includes(checksum), "the published checksum must match the actual bundle bytes");
  assert.ok(releaseNotes.includes(readFileSync(summaryPath, "utf8")));

  assert.throws(() => describeDevBuild(bundle, "v1.0.5b3-dev", env.SOURCE_SHA, "https://github.com/example/card"), /requested version/);
  assert.throws(() => describeDevBuild(bundle, "v1.0.5b2-dev", "short-sha", "https://github.com/example/card"), /full source commit/);
  const envBefore = readFileSync(envPath, "utf8");
  const notesBefore = readFileSync(notesPath, "utf8");
  const failed = spawnSync(process.execPath, [script, "prepare", "1.0.6", notesPath], { cwd, env });
  assert.notEqual(failed.status, 0);
  assert.equal(readFileSync(envPath, "utf8"), envBefore);
  assert.equal(readFileSync(notesPath, "utf8"), notesBefore);

  writeFileSync(bundlePath, "stale bundle");
  const stale = spawnSync(process.execPath, [script, "describe", notesPath], { cwd, env: buildEnv });
  assert.notEqual(stale.status, 0);
  assert.equal(readFileSync(notesPath, "utf8"), notesBefore, "an invalid bundle cannot append misleading provenance");
});
