import assert from "node:assert/strict";
import { extractReleaseNotes } from "../scripts/release-notes.mjs";

const changelog = `# Changelog

## [v11.0.0]
Wrong release: mentions 1.0.0 in its body.

## [v1.0.0]

### Breaking Changes
Requires Home Assistant 2026.9.0.

### Improvements
Keep all notes for this release.

## [v0.8.9]
Older release notes.
`;
const expected = "### Breaking Changes\nRequires Home Assistant 2026.9.0.\n\n### Improvements\nKeep all notes for this release.";
for (const heading of ["[v1.0.0]", "[1.0.0]", "v1.0.0", "1.0.0"]) {
  const variant = changelog.replace("## [v1.0.0]", `## ${heading}`);
  for (const version of ["1.0.0", "v1.0.0"]) {
    assert.equal(extractReleaseNotes(variant, version), expected);
    assert.equal(extractReleaseNotes(variant.replaceAll("\n", "\r\n"), version), expected);
  }
}
assert.equal(extractReleaseNotes(changelog, "11.0.0"), "Wrong release: mentions 1.0.0 in its body.");
assert.equal(extractReleaseNotes(changelog, "0.8.9"), "Older release notes.");
assert.equal(extractReleaseNotes(changelog, "1.0.1"), "");
assert.equal(extractReleaseNotes("## [v1.0.0]\n\n## [v0.8.9]\nOlder notes.", "1.0.0"), "");
assert.equal(extractReleaseNotes("## [v1.0.0-dev]\nPreview notes.\n", "1.0.0"), "");
assert.equal(extractReleaseNotes("## [v1.0.0-dev]\nPreview notes.\n", "v1.0.0-dev"), "Preview notes.");
