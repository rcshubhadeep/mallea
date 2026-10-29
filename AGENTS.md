# Mallea project guidance

Accepted PoC details: docs/FOUNDATION_PLAN.md, docs/DEMO_PLAN.md and docs/SLICES.md alongside the active snapshot. Build only what visible demo and runnable handoff need. Reuse existing code and suitable libraries, but never force Mallea's app/capability model around a library API or patch its internals; timebox fit checks and choose smaller alternatives where needed. Hosted HTTPS, base-app upgrade handling, broad provenance/state tracking and signed installer parity are deferred. Runnable source delivery and parallel platform instructions/evidence remain mandatory. Installed contributions can provide a Surface, Automation or both with real bounded execution, which may be deterministic after model authoring.

Read `docs/README.md` and the active project plan it identifies before implementation. The plan is the working guide for scope, architecture, execution, validation, and deliverables.

Project plan snapshots are immutable. When a plan decision changes, create the next numbered snapshot by copying the previous file byte-for-byte and applying only the necessary localized edits. Preserve all unchanged bytes, including whitespace and line endings. Do not rewrite, reformat, or regenerate the rest of the document. Record the reason and affected sections in `docs/CHANGELOG.md`, then update the active-plan link in `docs/README.md`. Never edit an older snapshot. See the complete procedure in `docs/README.md`.

Use `docs/STATUS.md` for implementation progress and test evidence. Routine progress does not require a plan revision unless it changes a plan decision.

## Required slice workflow

The current demo is an end-to-end proof to flesh out later, not a permanent narrow product boundary. Keep domain-specific behavior in app adapters and shared mechanisms driven by registrations. Preserve small practical seams for revisiting components/actions/triggers; do not hardcode finished workflows in the shared engine or build speculative generality before the working loop.

Before each slice, read the current status and inspect the implementation to verify it. Read both the overarching goal and the relevant detailed sections of the active plan. Run focused checks of the existing baseline; distinguish fresh verification from historical evidence.

Define a bounded slice with numbered work units, plan-milestone mapping, acceptance conditions, and explicit exclusions. Record the active work unit and its state in docs/STATUS.md; keep this current when switching work units. Several work units may be completed before the full slice report, but meaningful progress updates are still required.

Every slice report must state: **which plan milestone it advances, what acceptance condition passed, and what remains incomplete**. Do not mark a larger plan milestone complete just because one component passes. At slice completion, provide exact user test instructions, expected results, and known limitations; update the README for reproducibility. Record user feedback separately from automated verification.

README review is mandatory at the end of every slice. Update it whenever user-visible behavior, supported features/limits, setup, run/test instructions, or platform evidence changed. Preserve experience-first order and parallel Windows/Linux/macOS guidance. If nothing needs changing, explicitly record README reviewed; no changes needed in STATUS.md. Do not mark a slice complete before this gate is met.

Then return to the baseline/status/goal review before planning the next slice. Do not silently expand the active slice. If a scope or architecture decision changes the plan, create the next snapshot under the existing exact-preservation rules.

Keep shared documentation, examples, fixtures, and source portable: never include actual machine-specific absolute filesystem paths, home-directory names, or local checkout locations. Use repository-relative paths and say to run commands from the repository root. Local-only details belong in gitignored private notes. Check shared files for accidental path leaks before finishing documentation changes.

Keep the README experience-first: runnable preview instructions and current behavior precede a Developer Setup section containing detailed prerequisites, inference experiments, builds, and troubleshooting. Clearly distinguish working features from planned features.

Keep the root README product-facing and concise: idea, demo scope, supported behavior, run/setup/test instructions and honest limits. Do not include slice/work-unit/milestone identifiers, progress reports or implementation chronology there; keep those in docs/STATUS.md and planning/evidence documents. App UI must not expose internal slice labels. Every app gets the default Shape this app entry through shared framework chrome, outside the model-editable Surface; Surfaces, layouts and installed definitions remain independent per app.

Before replacing dependencies, stop this project's active preview/build processes, including agent-started sessions; Windows locks loaded native modules. Do not stop unrelated Node processes. If leaving previews running for the user, explicitly state that they must be stopped before npm ci. After an interrupted install, complete a clean reinstall before restarting previews.

Every significant setup, build, run, or validation step needed to reproduce results on another machine must be documented in the root README.md. Maintain parallel Windows PowerShell and Linux/macOS Bash/Zsh instructions, including prerequisites, configuration names without values, expected results, and relevant troubleshooting. Shared commands may be documented once with supported shells stated. Mark untested platforms explicitly; do not infer successful platform validation from portable-looking code. Update these instructions as part of the step, not afterward.

Use the configured development inference endpoint for initial tests. Reserve production inference budget for each completed milestone and targeted compatibility debugging. No automatic switch to production, unbounded retries, or bulk paid evaluations. Keep environment selection explicit and record usage without credentials. Read `docs/private/inference.md`, if present, for local configuration details; never copy private notes into shared documentation.

Never commit or print `.env` values. Keep credentials in the trusted service, outside browser bundles and generated plugins. Inspect existing configuration names only when needed. Design and implement this project independently; do not inspect or copy unrelated private application code. Keep the inference interface generic and configure endpoints, credentials, and model IDs externally.

Prioritize a convincing three-minute demonstration, substantive Meta model participation, and a working end-to-end slice. Do not substitute scripted outputs for live generation or claim unsupported security, offline operation, interoperability, or model performance.

Read docs/FOUNDATION.md when making scope/architecture decisions. Point-of-use app malleability and bidirectional capabilities are one core framework goal: neither should replace the other. The user's acceptable MVP limit is a small UI/layout/operation vocabulary, not a fixed menu of high-level workflows. Avoid turning the project into an IPC/messaging product or a set of named demo recipes. The engine should consume registered schemas and action references; domain adapters may remain specific. Agents should inspect and propose changes to a persistent live app model, including a meaningful working surface, rather than only filling a hardcoded panel.

Every build slice must advance a clear demonstration of that foundation or a reliable way for people to try its supported vocabulary. Require visible point-of-use transformation together with useful effects in both web-to-native and native-to-web directions. Keep replay/sample mode clearly distinct from fresh model authoring, minimize tester startup steps, retain explicit permissions and preview validation, and protect time for the final demonstration. Treat OS-level ambitions as the long-term design direction, not a claim of present OS implementation.

The Observer is the ONLY predefined agent supplied by the framework. It notices permitted per-app usage patterns and suggests useful changes. The always-present agent builder is a framework capability; its model calls do not imply an extra resident/default Builder agent. Users create additional agents in app with declared inputs, purpose, permissions, trigger, execution, and outputs/UI contributions. Keep the MVP execution bounded without reducing it to non-executable metadata. Preserve a future adapter boundary for classic-app connector data/actions; do not claim integrations that are not implemented. Spreadsheet/current-month-folder and word-processor examples explain the vision and do not authorize building those products.

Cross-app communication exchanges typed data, state, events, and permitted action requests/results through the existing protocol approach. Each app renders its own UI and edits its own local app model. Do not introduce cross-app transfer, embedding, mirroring, or synchronization of visual components/view trees in the MVP. Shared framework components and images exchanged as data resources are distinct from transferring another app's running UI.
