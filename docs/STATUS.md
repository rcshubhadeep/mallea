# Implementation status

## Active direction and work unit

- Active plan: PROJECT_PLAN.v021.md (unchanged). E001 W1-W5 implemented and verified on Windows; user acceptance pending. Current work unit: W5 completed; E001 awaiting user acceptance. Do not start E002 silently.
- Milestone advanced: E1 native foundation. Passed: persistent app descriptors/owner-event catalogue, native identity binding, independent Fieldnote/Parcel, app-scoped MCP, portable blank-project compile/launch, live Shape install/local save and regression checks. This does not complete the malleable-core/dashboard/Automation milestones.
- Reused the existing Tauri/React/SQLite/MCP/Surface/authoring paths. Generated projects copy built runtime/native sources and install their own pinned CLI. No new service fleet or general plugin manager.
- Main database retained, backed up before replacing the older companion. Core runs on port 4318; only the identified project companion/Core process was replaced. Model credentials stayed in the trusted engine; private app-host files are ignored.

## Fresh evidence — October 30, 2026

- Initial baseline: 36 tests and TypeScript passed. Final sequential suite: 39/39 passed; TypeScript and frontend/native builds passed. A parallel suite during Rust compilation hit four bounded worker deadlines/rejections; all passed sequentially after compilation with limits unchanged.
- Windows native Fieldnote and Parcel had independent titles/identities and online owner connections. Saved revision 4 was fetched from Fieldnote in Parcel; Parcel's newly posted feedback returned to Fieldnote. Existing content, customization/disabled state and grants retained.
- Three native apps connected simultaneously. Closing the blank app changed only its presence; both demo apps stayed online. Identity spoofing/control denial, app-specific MCP tools, grant denial/allow/revoke and registry restart are covered by focused tests.
- Separate temporary-folder project installed its own pinned tooling and built a fresh native target outside the checkout: 3m09s compilation with dependency downloads cached (not clean-machine timing). Initial updated shared-host build 1m40s; final cached rebuild 50s. Blank native content was only Shape access.
- Real development authoring added an Ideas/notes Surface, repaired two validation failures within the existing limit, previewed/approved/installed live, then persisted edited notes. No replay/template output substituted for generation.
- After restarting Core and all three native windows, the blank project's installed Surface and edited note were visibly retained; the two demo apps reconnected with their original identities. Core and the three test windows are left running for user testing; stop them before dependency replacement or rebuilding their executable.
- One explicitly selected direct-Meta service job passed on attempt 1 (about 7.4s, 6,535 input / 1,117 output tokens), including install/local edit and engine restart persistence. Development usage and private traces are ignored; no automatic production fallback.
- Detailed evidence and user instructions: REHEARSAL_E001.md. User feedback/acceptance is pending and is separate from automated/native agent-run checks. Linux/macOS native execution remains untested.
- README reviewed and updated: experience-first Core/two-app commands, portable CLI scaffold/build/registration/start, platform boundary, sequential regression command and bounded optional live-check steps. 178 shared files checked: no private development names or actual machine paths found; ignored secret/host files confirmed. Plan v019-v021 hashes unchanged.

## Remaining implementation boundaries

| Area | Working | Remaining |
| --- | --- | --- |
| Native foundation | Dynamic manifest/identity, registered native apps, scoped MCP endpoints, portable blank project | E003 graphical creator; E005 delivery/rehearsal |
| Malleability | Surface workspace/targeted edits, local text/color fields, persistent live install | E002 independent Surface identity/lifetime/composition, app-defined models/collections/operations, contextual editing, full framework-panel Surface coverage |
| Domain behavior | Fieldnote artwork and Parcel review adapters, permissioned manual two-way exchange | Domain adapters remain specific; no generic arbitrary workflow claim |
| Model settings | Shared trusted engine inference through explicit environment configuration | E003 Meta-only catalogue/settings; no OS vault claim |
| Communication/Automation | Owner routing, real presence, existing app-level grants | E004 Surface grants, auto-sync, semantic and deterministic Automation |
| Dashboard/catalogue | No dashboard product yet | E003 actual registry dashboard/metadata, illustrative catalogue and creator |

## Next slice

After E001 user testing, return to status/source/goal review and focused baseline checks, then E002 from SLICE_E002.md. Its units implement the malleable Surface/data foundation and contextual editing before the dashboard consumes it. Keep E001's source-only Core/CLI project delivery boundary explicit. Web product delivery and Observer remain parked.

Feature window: October 30-November 1. Protect November 2-3 for setup/rehearsal/video/submission. User target: November 4 morning Eastern Time; exact cutoff hour remains unverified.

## Rebase evidence

### Detailed execution sequence - 2026-10-30

- User asks for milestones, slices and work units. Added detailed E002-E005 definitions and replaced the sequence summary with one-to-one E1-E5 milestone gates. E001 remains the first implementation slice, not started.
- v021 replaces only the section-8 milestone table from byte-copied v020; original hash and unaffected prefix/suffix verified. Reason: make the malleable API precede the dashboard built on it. Scope and the accepted contextual Automation flow unchanged. Older evidence uses its historical milestone numbering.
- Passed documentation acceptance: explicit units, dependencies, exit gates, exclusions and target user tests; links/portability/snapshot/whitespace checks and focused TypeScript check. Existing 36-test runtime result is historical from the earlier baseline; no new runtime behavior or inference calls in this planning follow-up.
- README reviewed; no changes needed because supported behavior/setup/platform instructions did not change. Runtime implementation of E1-E5 remains incomplete. Feature budgets are October 30-November 1, with November 2-3 protected for freeze/rehearsal/video.

### Contextual authoring and Automation interaction follow-up

- User defines Automation as trigger -> transformer/input -> destination, and adds element context actions: Modify this surface and eligible Set Automation. Global Shape remains independently app-wide. Further clarification: Set Automation chooses trigger, transformation and destination in that order; triggers are presets written in simple English.
- Created v020 with two localized insertions from byte-copied v019. All unaffected byte ranges/original hash verified; CHANGELOG records both hashes. Added CONTEXTUAL_AUTHORING.md and aligned foundation, Automation examples, demo, slice sequence and standing guidance. E001 descriptor work includes owner/event metadata; context menus belong to E003 and guided Automation setup to E004.
- Clarification: a genuinely static list has no trigger; a read-only observable list can qualify only if its change event is declared. Trigger and data read are separate. Cross-app destinations must be compatible and writable under an actual grant. This records implementation semantics, not a claim these menus already exist.
- Advances design readiness for E1/E3. Passed: documentation scope/sequence defined, plan preservation, local links/path/private-name/whitespace checks. Incomplete: E001 implementation and all new contextual UI. No inference, native process, credential or user-data changes. Runtime tests not rerun for this docs-only change. README reviewed/updated with clearly planned behavior; run instructions unchanged.

- User explicitly permits in-place plan/document restructuring and prioritizes final engine/Surface/native-app vision. New v019 is an authorized full rebase; v001-v018 remain unchanged. Prior mutable documentation/guidance copied byte-for-byte under archive/desktop-engine-rebase before edits.
- Kept React/Tauri after local source inspection and review of official Tauri windows/configuration, directory-picker and prerequisites documentation. Current code's fixed app IDs/adapters and workspace-only activation are identified as concrete gaps.
- Added living brief, feedback checklist, date/slots and saved-design sync candidates; recommended one semantic Muse Automation plus approved sync, rather than four separate products.
- Updated active index, foundation, architecture, demo, sequence, E001, Automation ideas, catalogue brief, README and AGENTS. Old web/Observer guidance is historical. README reviewed/updated: current native prototype remains runnable, planned features explicit, parallel platform build/run/test instructions kept.
- Validation: 36 baseline tests, TypeScript, archive byte-copy preservation, prior snapshot hashes, local doc links, portable-path/private-name scan and whitespace checks. User acceptance of new implementation remains pending because it has not started.
