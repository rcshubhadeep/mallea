# Mallea project guidance

Read `docs/README.md` and the active project plan it identifies before implementation. The plan is the working guide for scope, architecture, execution, validation, and deliverables.

Project plan snapshots are immutable. When a plan decision changes, create the next numbered snapshot by copying the previous file byte-for-byte and applying only the necessary localized edits. Preserve all unchanged bytes, including whitespace and line endings. Do not rewrite, reformat, or regenerate the rest of the document. Record the reason and affected sections in `docs/CHANGELOG.md`, then update the active-plan link in `docs/README.md`. Never edit an older snapshot. See the complete procedure in `docs/README.md`.

Use `docs/STATUS.md` for implementation progress and test evidence. Routine progress does not require a plan revision unless it changes a plan decision.

## Required slice workflow

Before each slice, read the current status and inspect the implementation to verify it. Read both the overarching goal and the relevant detailed sections of the active plan. Run focused checks of the existing baseline; distinguish fresh verification from historical evidence.

Define a bounded slice with numbered work units, plan-milestone mapping, acceptance conditions, and explicit exclusions. Record the active work unit and its state in docs/STATUS.md; keep this current when switching work units. Several work units may be completed before the full slice report, but meaningful progress updates are still required.

Every slice report must state: **which plan milestone it advances, what acceptance condition passed, and what remains incomplete**. Do not mark a larger plan milestone complete just because one component passes. At slice completion, provide exact user test instructions, expected results, and known limitations; update the README for reproducibility. Record user feedback separately from automated verification.

Then return to the baseline/status/goal review before planning the next slice. Do not silently expand the active slice. If a scope or architecture decision changes the plan, create the next snapshot under the existing exact-preservation rules.

Keep shared documentation, examples, fixtures, and source portable: never include actual machine-specific absolute filesystem paths, home-directory names, or local checkout locations. Use repository-relative paths and say to run commands from the repository root. Local-only details belong in gitignored private notes. Check shared files for accidental path leaks before finishing documentation changes.

Keep the README experience-first: runnable preview instructions and current behavior precede a Developer Setup section containing detailed prerequisites, inference experiments, builds, and troubleshooting. Clearly distinguish working features from planned features.

Before replacing dependencies, stop this project's active preview/build processes, including agent-started sessions; Windows locks loaded native modules. Do not stop unrelated Node processes. If leaving previews running for the user, explicitly state that they must be stopped before npm ci. After an interrupted install, complete a clean reinstall before restarting previews.

Every significant setup, build, run, or validation step needed to reproduce results on another machine must be documented in the root README.md. Maintain parallel Windows PowerShell and Linux/macOS Bash/Zsh instructions, including prerequisites, configuration names without values, expected results, and relevant troubleshooting. Shared commands may be documented once with supported shells stated. Mark untested platforms explicitly; do not infer successful platform validation from portable-looking code. Update these instructions as part of the step, not afterward.

Use the configured development inference endpoint for initial tests. Reserve production inference budget for each completed milestone and targeted compatibility debugging. No automatic switch to production, unbounded retries, or bulk paid evaluations. Keep environment selection explicit and record usage without credentials. Read `docs/private/inference.md`, if present, for local configuration details; never copy private notes into shared documentation.

Never commit or print `.env` values. Keep credentials in the trusted service, outside browser bundles and generated plugins. Inspect existing configuration names only when needed. Design and implement this project independently; do not inspect or copy unrelated private application code. Keep the inference interface generic and configure endpoints, credentials, and model IDs externally.

Prioritize a convincing three-minute demonstration, substantive Meta model participation, and a working end-to-end slice. Do not substitute scripted outputs for live generation or claim unsupported security, offline operation, interoperability, or model performance.

Read docs/FOUNDATION.md when making scope/architecture decisions. Point-of-use app malleability and bidirectional capabilities are one core framework goal: neither should replace the other. The user's acceptable MVP limit is a small UI/layout/operation vocabulary, not a fixed menu of high-level workflows. Avoid turning the project into an IPC/messaging product or a set of named demo recipes. The engine should consume registered schemas and action references; domain adapters may remain specific. Agents should inspect and propose changes to a persistent live app model, including a meaningful working surface, rather than only filling a hardcoded panel.

Every build slice must advance a clear demonstration of that foundation or a reliable way for people to try its supported vocabulary. Require visible point-of-use transformation together with useful effects in both web-to-native and native-to-web directions. Keep replay/sample mode clearly distinct from fresh model authoring, minimize tester startup steps, retain explicit permissions and preview validation, and protect time for the final demonstration. Treat OS-level ambitions as the long-term design direction, not a claim of present OS implementation.
