# AGENTS.md

## Project overview
This repository contains the UniFi Device Card project.
Treat it as a user-facing Home Assistant custom card for HACS distribution.
Preserve existing behavior where practical and avoid unnecessary breaking changes.

## Instruction priority
- Follow explicit user instructions over general repository conventions.
- If repository rules and the current task appear to conflict, prefer the explicit user request.
- Do not assume permission for destructive, generated, or asset-related changes.

## Branch policy
- Use `develop` as the Codex working branch by default.
- Do not open, target, or base Codex changes on `main` unless explicitly requested by the user.
- Treat `main` as the stable branch for releases.
- Assume ongoing development happens on `develop`.

## Working style
- Inspect the existing repository structure and conventions before making changes.
- Prefer small, targeted changes over broad refactors.
- Do not rewrite unrelated code just to improve style or structure.
- Keep naming, formatting, and file organization consistent with the existing codebase.
- Preserve backwards compatibility whenever reasonably possible.
- When fixing a bug, change the minimum necessary code and avoid regressions.

## Repository structure
- `/src` contains the maintained source code and is the source of truth for implementation changes.
- `/dist` contains generated build output for distribution.
- `README.md` and `CHANGELOG.md` are located in the repository root.
- `/screenshot` contains repository screenshots and is maintained manually by the repository owner.

## Source of truth
- Always treat `/src` as the primary place for implementation work.
- Treat `/dist` as generated output.
- Do not make manual logic changes directly in `/dist` unless the task explicitly requires it.
- When implementation changes are needed, make them in `/src`.
- Assume `/dist` will be updated by the normal build or workflow process after `/src` changes.

## Pull requests and review focus
- Focus review attention on hand-written source files, especially `/src`.
- Treat `/dist` changes as expected build artifacts when they correspond to `/src` updates.
- Do not treat `/dist` as the meaningful implementation diff in pull requests.
- In summaries and reviews, describe the `/src` changes first and mention `/dist` only as generated output if relevant.
- Avoid cosmetic-only diffs unless explicitly requested.

## GitHub workflows and automation
- Always inspect `.github/workflows/` before making changes that affect build, release, validation, or packaging behavior.
- Treat workflow definitions as part of the project contract.
- Do not introduce changes that would obviously break CI, release, build, lint, or validation jobs.
- If documented commands differ from workflow definitions, prefer the workflow definitions.
- Keep GitHub Actions and HACS-related behavior stable unless the task explicitly targets those areas.

## Documentation
- Update `README.md` only when installation, usage, configuration, features, or visible behavior changes.
- Update `CHANGELOG.md` when the task results in a user-visible change that belongs in release notes.
- Keep changelog entries concise, factual, and scoped to the real change.
- Do not rewrite documentation for style alone unless explicitly asked.

## Screenshots
- Do not modify, replace, delete, rename, generate, or save files in `/screenshot` unless the user explicitly requests it.
- Assume `/screenshot` is maintained manually by the repository owner.
- Attached screenshots are reference material only unless the user explicitly says `screenshot speichern` or clearly instructs that a screenshot should be used for the project.
- Do not infer permission to update project screenshots from a UI discussion alone.
- If a task changes UI behavior, you may mention that screenshots could need manual review, but do not update them automatically.

## File protection
- Do not delete or rename `README.md`, `CHANGELOG.md`, `.github/workflows/*`, or files in `/screenshot` unless the task explicitly requires it.
- Be careful with release, packaging, and distribution-related files.
- Do not change version numbers, release packaging, or workflow behavior unless the task explicitly requires it.

## Home Assistant custom card expectations
- Keep configuration options backwards compatible where possible.
- New options should be optional and have sensible defaults.
- Avoid noisy errors for missing optional entities or unavailable sensors.
- Prefer graceful fallbacks over hard failures.
- Keep editor behavior stable and avoid resetting user selections unintentionally.
- Preserve translations unless user-facing text actually changes.

## Validation
- Run the project's relevant build, lint, and test steps when available and relevant to the task.
- If no automated tests exist, perform a careful static review of the changed files.
- Pay special attention to regressions in editor behavior, configuration compatibility, translations, and release packaging.
- If verification could not be completed, say so explicitly.

## Output expectations
- Explain what changed and why.
- Call out assumptions clearly.
- Mention what was done in `/src`.
- Mention `/dist` only as generated output when relevant.
- If documentation or changelog updates were intentionally skipped, say why.
- If screenshots may need attention, mention that they require manual owner action unless explicitly requested.
