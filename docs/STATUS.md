# Implementation status

## Active direction and work unit

- E004 W1-W6 implementation/agent-operated Windows checks complete; awaiting user Windows then macOS acceptance/fixes. Milestone advanced: E4 permissioned Automation. Final suite 66/66, TypeScript, frontend and Windows native build passed. Native three-step Muse execution, independent recipient transfer, activation-before-grant denial and post-revocation blocking passed; owner permission changes were API-operated, not UI clicks. Isolated owner-socket tests cover both artwork/review directions, retention, scoped permissions, persistence, stale/offline conditions, action-contract changes and removed resources. README reviewed/updated. Exact user steps/limits: REHEARSAL_E004.md; Mac setup: MACOS_TEST.md. Active plan v024 adds only the user-directed Windows -> macOS tests/fixes -> E005 gate; prior hash and unaffected bytes verified. E005 is not started. Remote routing, Observer, general graph editing and Linux validation remain excluded.

### E004 work units and fresh evidence — October 31, 2026

- User completed receiver sharing, source contextual copy authoring, owner Allow and reviewed activation. Fresh authenticated test-app check confirms the new copy is enabled and the recipient write grant is allowed. The older preconfigured synthetic copy was paused (only after verifying the newer enabled copy exists) to avoid competing transfers; the user's new definition and data were retained. This accepts authoring/permission setup, not transferred-data or revocation outcomes yet. No source changes or inference calls; README reviewed/no changes needed. Next: Run now, changed-input auto-sync, revoke. E4 Windows acceptance continues; Mac/E005 gates unchanged.

- User confirmed the subsequent in-app test worked, following the explicit Pause -> edit without output change -> resume/Run now instructions. Record pause/resume/manual-run as user-accepted for that reported flow. No code or inference changes were made in this feedback turn. Next Windows acceptance is owner-approved cross-app copy/revocation; Mac tests/fixes follow. README reviewed; no behavior/setup changes to document. E005 remains on hold.

- Latest user acceptance: after initially reporting that typing appeared to trigger only once, the user confirmed "It worked." A fresh read-only check showed the enabled semantic Automation completed and its applied-input digest matched the latest saved Brief, with five Concepts items. This accepts the reported Brief-to-Concepts flow, not all repeated-edit/failure/permission cases. No missed-trigger defect was established and no runtime change/model call was made for this investigation. README reviewed: existing typing-pause, model-processing and manager outcome guidance still applies; no change needed. Windows pause/resume and owner-sharing/revocation tests, then Mac acceptance/fixes, remain pending; E005 stays on hold.

- Follow-up R1-R3 complete: user screenshot showed empty dashboard data after reopening. Fresh diagnosis: Core returned eight apps/six concepts but the dashboard host capability differed. A failed duplicate startup could overwrite host capabilities before failing to bind. R1 now binds before opening the store/publishing connection files; regression proves existing files remain byte-identical and running session Surfaces survive a failed duplicate start. R2 surfaces dashboard connection/action failures through the existing recovery notice. R3 frontend/native rebuild and Core restart restored the actual native dashboard's eight apps/six illustrated concepts. Focused baseline: five dashboard tests and TypeScript passed; final suite 67/67, TypeScript/frontend/Windows native build passed. Current private key/path/link/plan audits passed (213 shared files, four runtime artifacts, 18 database tables). README reviewed/updated for duplicate-start/reopen recovery; plan v024 unchanged. No inference or user-data reset. Core/dashboard are running; the existing Automation study window was opened for the user's pending test. Advances E4 repair only; Mac and user Automation acceptance remain pending, E005 not started.

- User feedback after handoff: guides were confusing; all native windows were closed. Fresh check confirmed Core still listening and no native app windows running. This is reopening/help feedback, not Automation acceptance. REHEARSAL_E004.md now separates the already-built/Core-running path from upgrades/fresh setup; README reopen guidance reviewed and remains applicable.

| Unit | Result |
| --- | --- |
| W1 | App-specific MCP metadata/read/write/declared-action tools; owner-authenticated app/Surface resource grants; discovery carries no current values; legacy engine access bypasses denied |
| W2 | Approved Fieldnote saved-artwork -> Parcel and Parcel review -> Fieldnote pipelines; feedback retention, independent revocation, offline/reconnect, copy-loop and append-dedup regression checks |
| W3 | Persisted typed executable records, one transformer, replace/append, pause/run/outcomes; latest input and destination stamps checked before commit |
| W4 | Shared contextual three-step English wizard and manager built from system Surfaces; nested observable list context, compatible destinations and activation gating checked natively |
| W5 | Genuine Muse text-to-list output; actual changed color/photo constraint reflected; local copy distinguished from semantic processing; one in-flight job and typing gate |
| W6 | Full suite 66/66, TypeScript, frontend/native build; Windows native execution, targeted direct-Meta check, restart retention, documentation and private-name/path scan |

- Fresh entry baseline: 12 focused engine/live/launch tests plus TypeScript. Initial full suite 60 passed; expanded suite 66 passed after fixing a test fixture to use declared collection.append arguments. Limits were not weakened. No dependency/framework additions were required.
- Native test Surfaces were explicit deterministic fixtures in two labelled test apps, not claimed model-authored app creation. Their Automation semantic output was genuine Muse. Native wizard selected English trigger/processor/destination, blocked activation before access, then enabled/executed and transferred to the independent recipient owner. Owner share/request/allow/revoke operations in this native check used authenticated Core APIs; full permission UI clicks remain user acceptance. Existing user artwork/notes were not reset or used as disposable fixtures.
- Real inference: isolated development changed-constraint/transfer/revoke check, two calls/1,625 total tokens; native changed-constraint extraction, one call/1,211 tokens; explicit direct-Meta compatibility, one call/849 tokens. No automatic fallback or scripted semantic response. Reports/timings/usage stay private. No additional inference was used for final restart checks.
- After final backend restart, native owners reconnected, semantic output/model usage survived, revoked copy remained blocked and the recipient retained its prior list. Core/dashboard and the two labelled native test apps remain running. Core uses development configuration. Save/close project windows and stop the identified Core before npm ci or executable replacement.
- Final audit: 212 shared files checked without machine-path/private-name leaks; plan v024/v023 hashes and localized-change preservation checked. Current guide links resolve. Configured model keys were absent from all four rebuilt runtime/native artifacts and all 18 Core database tables. No new credential persistence or production isolation is claimed.
- README reviewed/updated for actual sharing/Automation behavior, one-time generated-project sync/build, portable commands, suite count and honest platform limits. Existing generated notetakers need that runtime upgrade; identity/Core data remain. The dashboard still resolves their own executable, so an old project binary cannot gain the new UI merely by restarting Core.
- Remaining: user Windows tests (including owner Allow/revoke clicks and live artwork save/review), then Mac build/native/blank-project/Automation tests and necessary fixes. Linux waits. One-transformer/24-record limit, no delete/edit-Automation UI, no remote transport/scheduler. E005 recording/delivery is intentionally on hold.

## Historical evidence and prior user feedback
- E003 user acceptance recorded: the user created a blank app, reshaped it into a simple notetaker, modified one Surface in place and confirmed dashboard app launching. E3 is accepted for these reported flows. User also reports committing/pushing the work; the working tree was clean at this feedback check. Remote push was not independently audited. E004 is next, defined but not started.
- E003 follow-up F1-F3 complete: reopening guidance, trusted local app launching, ordinary Surface button with one-time preserving upgrade, native checks and README handoff. Active plan v023 adds only local launch behavior in section 6; v022 and unaffected bytes were verified. Advances E3 only; E004 has not started. Fresh baseline: five dashboard tests and TypeScript; final suite 53/53, TypeScript and frontend/native build passed. At entry Core was running and no native app processes were found.
- Prior user feedback: dashboard generally and its other functions worked, while new-app creation was then untested. The later acceptance above supersedes that pending creation/launch scope. The dashboard was stopped and the user requested a clear reopen command and in-dashboard app launching.
- Original October 31 handoff: E003 W1-W5 complete with agent-operated Windows acceptance; user acceptance was then pending and is now recorded above. Milestone advanced: E3 dashboard and project creation. Native dashboard/metadata, shared profile selection, native folder choice, actual new-project compile/launch, model-authored notes input/Add/list, persistence, catalogue preview and direct-Meta scoped refinement passed. Fresh entry checks were 9/9 focused engine/live tests; the initial restricted connection run could not complete and is not counted as passing evidence. E002 user acceptance below remains separate.
- Active plan at E003 handoff: PROJECT_PLAN.v023.md. Original E002/E003 implementation followed unchanged v022; E002's four user Surface-modification tests were accepted. The v023 local-launch addition was explicitly requested by the user and does not change E004/E005 scope.
- E2 foundation retained: Fieldnote, Parcel, blank-project apps and now the dashboard share one LiveApp host, independent Surface/model registry, renderer, event/action dispatch and scoped/global authoring. No separate legacy app-layout path remains in the native entry.
- Domain behavior stays in registered adapters; their typed schemas/actions/primitives are persisted and included in the common inventory. App-owned Surfaces, including the canvas, may be removed/re-added without deleting their data. System recovery/approval UI is protected by ownership and uses the same Surface primitives.
- The existing database and private identities were retained. A stopped-service backup preceded migration; live_backups retains predecessor workspace/local state. No model keys were migrated into app records or generated projects.

### E003 local-launch follow-up evidence

- F1: Core resolves registered private launch locations and validates app identity; no UI-selected executable/command/path is accepted. Shared native launch/environment handling is reused by CLI launching and project creation. Unit checks cover missing builds, malformed/unknown requests, startup deduplication, already-running apps and child credential exclusion.
- F2: Open app is a declared button/action in the dashboard's ordinary item template. A one-time registry migration adds it without replacing other UI/model data; later user removal remains respected. Native settings/launch control remains restricted to the dashboard host.
- F3: Native Open app launched Fieldnote and the existing Seed Notes project from its own compiled executable. The latter retained saved notes. Opening Fieldnote again reported already running and retained one window. Final full suite: 53/53. No model calls were needed for this follow-up.
- Final handoff checks passed: active v023/prior v022 hashes, current guide links, 203 shared files without machine-path/private-name leaks, four rebuilt runtime files without configured model keys, unauthorized launch denial and persisted one-time upgrade marker. Core is in development mode; dashboard, Fieldnote and Seed Notes each show one connected window.
- README reviewed and clarified: Open Mallea again comes before first-time Developer Setup, distinguishes Core running/stopped, and gives the dashboard reopen command for Windows/Linux/macOS. Ordinary reopening requires no reinstall/rebuild. In-dashboard launching and its limits are described; progress remains outside README.
- At the follow-up handoff, creation/launch acceptance was pending; the latest user confirmation above now covers those flows. Exact steps are in REHEARSAL_E003.md. Processes were left running at that handoff, not freshly checked during this feedback update. Linux/macOS native execution remains untested. Missing/moved project builds need manual recovery; already-running windows are not automatically focused.

## E003 work units and acceptance — October 31, 2026

| Unit | Result |
| --- | --- |
| W1 | Five dashboard Surfaces, shared renderer/item templates and real app registry metadata/detail; Fieldnote inspection and app independence checked natively |
| W2 | Registered Meta profiles, dashboard-only native control boundary and session key entry; subsequent jobs use selected configuration; public/registry/project records exclude keys |
| W3 | Native parent-folder picker, exclusive scaffold, serialized compile and independent blank-app launch; collision/failure preservation checked; source-only output also compiled outside checkout |
| W4 | Six original bundled SVG concepts, labelled previews, native Lumen preview checked; no fake marketplace operations |
| W5 | New native app built through Shape with working input/Add/list; app/Core restart persistence, real two-way owner routing, direct-Meta refinement, final checks and documentation/handoff |

### Fresh E003 verification

- Final full regression suite: 50/50; TypeScript and frontend/native build passed. A final registry-only refinement persists typed read-only collection declarations and avoids rewriting identical adapter schemas; all five dashboard tests and TypeScript passed after it. Prior E002 checks below are historical, not substituted for this slice.
- Native creator produced a genuinely blank app from a selected folder and its own newly compiled executable. Development model authoring used three bounded attempts, then preview/approval/install; native Add saved a note across two independent Surfaces. Both Core and that project's own executable were restarted and retained the Surfaces/note.
- Direct-Meta profile was explicitly selected through native dashboard settings. Muse Spark 1.3 refined one heading on its first attempt, one call/1,995 tokens. Installed style/bindings, unchanged other Surface and retained note were checked. Development authoring was separate; usage/traces remain private and no fallback occurred. Core was subsequently restarted in development mode for handoff.
- Closing the dashboard left Fieldnote, Parcel and the generated app running. Both actual owner-routed manual data directions passed after restart under existing grants. Dashboard-only system panels remain limited to the dashboard after restart; the regression is tested.
- The six concept illustrations were visually checked and Lumen preview opened with its illustrative label. A hidden root previously reserved an empty column; the shared layout fix removes that footprint.
- A source-only project copy compiled outside checkout in 52.3 seconds with the existing compiler cache, without copying host credentials. This is not cold-machine/toolchain timing. Compiler/launch environments strip inference credentials. Keys were absent from eight checked runtime/native artifacts; active v022 remains unchanged.
- README reviewed/updated: dashboard/model settings, graphical creator/reopen, session configuration, exact environment names, test count and parallel platform commands. No slice history was added. Linux/macOS and fresh-machine delivery remain untested.
- Core, dashboard, Fieldnote, Parcel and Seed Notes are left running for user tests. Do not start another Core on port 4318; close identified project processes before npm ci or executable replacement. Private project locations/reports stay under ignored runtime data. Database/WAL/SHM were retained together in the stopped restart snapshot; no user data was reset.

### E003 user testing and next slice

The user confirmed new blank-app creation, incremental notetaker composition, a scoped Surface edit and dashboard launching. This does not independently confirm every optional restart/export/clean-machine/platform case. Exact test prompts/limits: REHEARSAL_E003.md; run/setup/reopen commands: root README. Next is E004 W1-W6 under unchanged v023: Surface-scoped permissions, approved two-way subscriptions, executable pipeline, contextual three-step builder, genuine Muse transformation and native/failure acceptance. Source inspection still shows manual registered owner routing and unavailable Automation setup; those are not E4 acceptance. Before implementation run fresh focused baseline checks and track W1 first.

This acceptance/status update changes no runtime behavior. No runtime tests were rerun; the preceding 53-test/build/native evidence remains historical. README reviewed; no changes needed because supported behavior, commands and limits are unchanged. Plan v023 unchanged.

## E002 work units and acceptance

| Unit | Result |
| --- | --- |
| W1 | Independent app/Surface/element/model identities, registered adapter schemas, placement/version/lifetime and recoverable migration; all three app paths checked |
| W2 | Typed fields/collections, model extension, input events and declared append/remove actions; native input/Add produced a saved item; invalid/stale writes denied |
| W3 | One shared native host and system-Surface builder/context/preview/approval. Right-click ownership/focus, scoped edit enforcement and global composition verified; unrelated definitions/data retained |
| W4 | Persistent/session lifecycle, real disconnect/reconnect-grace test, data retained after presentation removal. Native PNG and JSON save dialogs exercised; bytes and explicit JSON destination verified |
| W5 | Real model-authored two-Surface app, live native edits/install, separate project rebuild, restart/owner-routing checks, documentation and user handoff |

## Fresh verification — October 30, 2026

- Starting baseline: 12 focused predecessor tests and TypeScript passed. Final suite: 45/45 sequential tests passed, plus TypeScript and frontend/native builds. A late socket-close callback initially queried a closed database; it was fixed and lifecycle/full-suite checks passed afterward. Execution limits were not weakened.
- Live development authoring: a fresh two-Surface notes app plus scoped refinement; Fieldnote native right-click/preview/approval/install changed the versions font size; Parcel scoped note styling changed; the existing notes app gained independent input/list Surfaces while retaining its original Ideas note. Its native Add button saved a visible item. No scripted model output replaced generation.
- A scoped model refinement removed a misleading literal empty-state label. JSON-only formatting fences are accepted without bypassing schema/scope checks; unknown targets and unsupported requests still fail or use bounded repair.
- Direct-Meta isolated check: creation passed on attempt 1; scoped refinement on attempt 2 after correcting a target ID. Three calls, 10,470 total tokens. Typed input/append, approved installs, unaffected Surfaces and saved values retained. Development usage/traces remain private; no automatic production fallback.
- Core and native app restarts retained definition edits, original notes and new collection items. Final owner-routed reads in both directions passed after migration: Fieldnote saved revision 6 reached Parcel, feedback returned, Surface-definition hashes unchanged.
- The standalone notes project was refreshed/backed up with sync-project and rebuilt outside the checkout using only a shared compiler cache. Its own manifest/private identity/executable remain in its project. The updated shared host and standalone host built successfully; cache timings are not clean-machine performance claims.
- Native PNG export matched the saved 640 x 420 image exactly (60,203 bytes). A separate native JSON export reached an explicitly typed ignored destination and parsed with the expected Surface bindings. Native save-picker behavior is separate from model filesystem access; generated code receives no arbitrary path bridge.
- Runtime artifact scan: 10 files across the framework and generated-project runtimes, both configured model keys absent. Shared-file path/private-name and immutable-plan checks passed. Model credentials were never printed or committed.
- README reviewed/updated: common runtime/editing flow, schema/collection behavior, temporary lifetime, export, generated-project upgrade, parallel Windows/Linux/macOS commands and live checks. Linux/macOS native execution remains untested. User feedback is separate below.

- Registered canvas text/position events now traverse the same typed Core dispatch. Native drag testing produced Unsaved changes through that path; the temporary test move was discarded by reopening, leaving the saved artwork intact. Unknown primitive events/payloads and out-of-bounds values are rejected.

## Remaining work and limitations

- E3 implementation and reported user flow acceptance complete. E4: Surface-sharing grants, approved auto-sync and executable Automations. E5: clean setup/platform checks, final rehearsal/video/submission. Web delivery and Observer remain parked.
- Current vocabulary is bounded: registered adapters/primitives, typed fields/collections and declared operations; no arbitrary generated native code or universal expressions. Existing field types are retained; use new fields for changed types. Preview buttons do not write to Core; preview input edits stay separate.
- Sharing remains the existing app-level manual flow; scoped editing enforcement is not a claim of completed Surface-sharing grants. Local app credentials remain developer bootstrap files, not production hostile-process isolation or a key vault.
- Core and the three native apps are left running for testing. Reuse Core rather than starting a duplicate on port 4318. Stop project processes before npm ci or rebuilding their executables.

## Historical E002 user testing

The user confirmed all four E002 handoff flows worked: Fieldnote scoped typography, Parcel scoped styling, global addition of a separate notes Surface, and the existing notes app's Add/list behavior. This establishes user acceptance of those flows, not independent confirmation of every optional lifecycle/export test, project creation or clean-machine setup. Full test prompts and limits: REHEARSAL_E002.md; setup/run/upgrade commands: root README. Re-read status/source/goal and verify the baseline before E003. Do not silently expand this slice.

### E002 user feedback — October 30, 2026

- User: “All of them worked.” Recorded against the four Surface-modification tests in the immediately preceding handoff. Earlier E001 feedback below remains historical and separate.
- Milestone advanced: E2 malleable application core. E3 dashboard/project creation is next; Surface-sharing grants and executable Automations remain E4.
- Documentation-only acceptance update; no runtime changes or new test runs. The 45-test/build/native/model evidence above is retained from the implementation handoff. README reviewed; no changes needed because behavior, setup and supported limits are unchanged. Active plan unchanged.

## User feedback — October 30, 2026

- User reports testing the existing-window flow listed in the handoff: Fieldnote saved revision to Parcel, Parcel feedback to Fieldnote, and the already-running notes app. No issue was reported in this message.
- User explicitly did not create a blank project or try Surface editing this time. Those paths retain their separate agent-operated evidence; this feedback does not establish user acceptance of them or a clean-machine setup test.
- Documentation-only feedback update; no runtime changes or new test runs. README reviewed; no changes needed because behavior, setup and supported limits are unchanged. Active plan unchanged.


## Historical planning evidence

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
