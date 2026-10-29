# Slice 003A: new local data in composed Surfaces

State: complete, agent-verified; user acceptance pending. Correction to M1's generality gap, before Slice 004. User's request: add a new writable note panel above the existing web content; same ability must exist in desktop. This is framework-owned state, not a special Parcel notes action. Follow active plan v015 and foundation. Evidence and exact user tests: REHEARSAL_003A.md.

Fresh baseline: 25 tests and TypeScript pass. Inspection confirms SDK 0.3 only binds pre-existing registered fields, causing the honest but unacceptable refusal in the user's screenshot. Prior happy-path acceptance did not establish this capability. Keep the small primitive vocabulary; fix data creation within it.

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Record correction, state grammar and exact acceptance; immutable plan revision | New local text/color fields are available in both hosts without per-domain note features; no arbitrary schema/DB editor |
| W2 | Extend strict declarative schema and existing SQLite/install path | Up to 16 typed local fields, explicit permission, app+Surface identity isolation, defaults, compatible value retention and stale-write rejection; no external writes |
| W3 | Shared renderer/local-state editing and preview | Inputs bind new fields, preview never persists; live edits save on blur or explicit Save local changes, with honest status; refinements preserve values |
| W4 | Regression, exact real-model browser and actual native checks | Request generates additional writable panel while retaining existing app content; type/save/reload/refine retains note; both hosts supported; wrong app/undeclared/stale cases denied |
| W5 | README vocabulary/limits/test path and evidence handoff | User can reproduce new-field creation; no internal tracking labels in README; report milestone/passed/incomplete |

Model declares optional state map of named fields with type text/color and initial value. Bind as local.fieldName. Local input controls use the framework setter implicitly; existing app resource/action bindings stay protected. No generic remote DB writes, migrations, schema builder UI, multiple independently installed packages, arbitrary scripts or new layout primitives. Multiple panels compose into the app's existing versioned workspace definition. Keep schema keys stable through refinement; preserve data when a panel is temporarily removed/disabled.

Exact web request: Add an extra panel for me, local to my web. I want to add notes there. Stack it horizontally over the present panel. Verify an editable textarea and retained asset view, not a prewritten notes recipe. Also verify equivalent new field in Fieldnote, independent of Parcel and revision note. Model chooses key/label/layout from vocabulary; no keyword branch.

No production fallback or paid batch. Development authoring first; one bounded target-Meta check after completed correction. No automatic paid retries beyond the existing initial plus two repairs per job. Reuse libraries and existing service/author/version scaffolding. No dependency replacement needed.
