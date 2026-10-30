# Mallea project guidance

Active product direction: desktop Core engine, independently running Tauri apps, Surface-defined interfaces/data/events/actions, shared Meta-powered authoring, app-specific MCP interfaces, app/Surface grants, executable Automations, dashboard/catalogue and portable blank-project creation. Web product delivery and Observer are parked. Read docs/README.md, its active plan, docs/FOUNDATION.md and detailed slice before implementation.

The October 30 user-authorized documentation rebase created v019 and archived prior mutable guides. Future plan decisions resume immutable snapshots: copy active plan byte-for-byte to next number, make localized edits only, verify previous hash and unaffected bytes, append CHANGELOG and update active index. Routine progress belongs in docs/STATUS.md. Do not follow superseded web/Observer-first slices.

## Required workflow

Before each slice inspect status/source, overarching goal and relevant detailed plan; run focused baseline checks and distinguish fresh evidence from history. Define bounded numbered work units, milestone mapping, acceptance and exclusions. Keep current unit/state in STATUS.md. Do not silently expand scope.

Every slice report states milestone advanced, acceptance passed and remaining work. At completion give exact user tests, expected results and limits; record user feedback separately from automated/agent-operated checks. README review is mandatory: update changed behavior/setup/run/test/platform guidance, or explicitly record reviewed/no changes. Return to baseline/goal review before the next slice.

Keep README brief, product-facing and experience-first: working behavior/run instructions before Developer Setup; clearly label planned features. No slice/work-unit progress history in README or app UI. Keep Windows PowerShell and Linux/macOS Bash/Zsh instructions, exact configuration names without values, and untested platforms explicit.

## Architecture and product discipline

All app-owned visual elements and interactions use the Surface API, including ordinary app and framework panels. System-owned approval/credential/recovery Surfaces have appropriate ownership; OS chrome and primitive internals remain native boundaries. Never hide whole apps in opaque trusted components to simulate compliance. The shared agent can inspect/edit the full authorized API, not arbitrary native/filesystem/network execution.

Separate app, instance, Surface, element and model identities. Definitions/schemas/bindings/actions/events/Automations are inspectable registry data, hot-updated without app refresh and persisted when declared. Session lifetime is explicit. Presentation removal is distinct from deleting model data. Generic model/collection operations must allow useful incremental app creation from blank, not just rearrangement of fixed demo fields.

Implement the shared contextual authoring model from docs/CONTEXTUAL_AUTHORING.md: Modify this surface scopes Shape to the owner/focused element; global Shape retains app-wide context. Set Automation is enabled by declared trigger capability, not incidental DOM events. Its guided steps are preset English trigger, transformation/input/processor, and compatible permitted destination. Enforce scope/grants in Core; do not rely only on prompt wording.

Core handles local discovery/routing/shared Meta configuration and persistence. Dashboard shows actual metadata; apps run independently and continue when dashboard detail closes. Each app has its own MCP interface; a distinct engine-hosted app-scoped facade is acceptable, a global unrestricted catalogue is not. Discovery grants no access. Engine/owner enforce app/Surface-scoped permissions; approved subscriptions may auto-sync. Exchange typed data/state/events/actions, never another app's live visual tree.

Automations are executable typed trigger/input/steps/output definitions, not metadata. Distinguish model authoring, genuine Muse semantic execution and deterministic operations. Bound requests/retries/output, gate rapid events, reject stale output and report outcomes. No new scheduler/workflow framework unless a concrete accepted slice needs it.

Reuse existing React/Tauri, Surface renderer/validator/targeted edits, Node/SQLite, official MCP SDK, owner sockets, Fabric and tests. Libraries must fit supported APIs behind small adapters; do not bend Mallea's model around them or patch internals. Do not create empty packages, third polished products, remote transport, marketplace services, OS work or Observer. Protect final video/setup time.

## Credentials, files and reproducibility

Only Meta model identities are allowed in the target shared model catalogue. Reuse a generic inference interface with externally configured endpoints/keys/models. Initial tests use explicitly selected development settings; production Meta budget is for completed checks/targeted compatibility, no hidden fallback or bulk paid evaluations. Read ignored docs/private/inference.md when needed. Never copy private infrastructure notes into shared docs.

Never print/commit .env values. Model keys stay in trusted engine/native storage, never generated projects, Surface records, model context or app bundles. Session-only credentials are acceptable first; persistent storage uses an established native facility, not custom encryption/plaintext registry values. Do not claim implemented key policy/storage until verified.

Keep shared docs/source/examples portable: no real machine-specific absolute paths, home names or checkout locations. Use repository-relative paths and root-run commands. Local project paths belong in private runtime configuration. Check path/private-name leaks and local links at documentation handoff.

Before replacing dependencies stop only identified project previews/builds/native sessions, including agent-started ones, to avoid Windows native-module locks. Do not stop unrelated Node processes. Complete a clean reinstall after an interrupted install before restarting previews. If processes are left running, tell the user to stop them before npm ci.

Scaffolding uses a user-chosen new folder, refuses existing-target collisions, and produces portable relative runtime references. Do not overwrite unrelated work or delete user data for cleanup. No credential migration or filesystem reorganization without concrete need. Test scaffolds use ignored/temporary folders with checked paths.

Prioritize a convincing real three-minute demo, substantive Meta use and runnable delivery. Do not substitute scripted outputs for generation, invent OS metrics/catalogue adoption, or claim production security/offline/remote interoperability. Design independently; do not inspect/copy unrelated private application code.
