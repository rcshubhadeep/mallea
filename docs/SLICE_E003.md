# E003: dashboard and project creation

State: W1-W5 implemented and agent-verified on Windows October 31; user reports general dashboard functions work, but new-app creation remains untested by the user. Milestone E3. User-authorized v023 follow-up adds reopening clarity and local app launching: F1 trusted launch routing; F2 shared Surface button with customization-preserving upgrade; F3 native regression and README handoff. Evidence and exact user tests: REHEARSAL_E003.md and STATUS.md. Depends on E001 host/scaffold proof and E002 Surface/data composition. Read active plan and verify the current baseline before the next slice.

## Work units

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Dashboard as a Surface-based app consuming actual registry collections | Running app cards and detail pages show real name/author/purpose/presence, Surfaces/models and declared shared data. Opening/closing details does not own app lifetimes. No invented OS performance statistics or app-specific hardcoded cards. |
| W2 | Shared engine model settings and trusted credential boundary | Configure one explicit active Meta profile; all apps use it. Non-Meta/unregistered choices rejected. Key never enters app registry/data/models/bundles or agent context. Session-only storage is acceptable and labelled; no automatic production fallback. |
| W3 | Native folder picker, project scaffold, build progress and launch, reusing E001 spike | Choose a new folder/name; reject collisions; compile and launch a genuinely blank native app. Output builds outside the original checkout through portable runtime references. Cancelling/failing creation cannot overwrite an existing project. |
| W4 | Illustrated concept catalogue with bundled original art and preview details | Named entries and images are visible and clearly illustrative. No fake working Install, ratings, users or catalogue backend. Existing real demo apps remain distinguishable from concepts. |
| W5 | Actual end-to-end dashboard/new-project check and reproducible handoff | Fieldnote/Parcel remain independent; create third app from dashboard, use Shape to add working content, reopen it, and verify shared model readiness. Document native/source prerequisites and clean stopping; run README review. |

## User acceptance target

Open dashboard with Fieldnote and native Parcel running. Inspect actual metadata, configure the shared Meta model without exposing the key, browse concept cards, select a new project folder and launch its blank app. Build something small using E002 tools. Closing dashboard/detail views should leave apps running while Core remains available. Exact implemented commands and user tests belong in the completion handoff/README.

## Exclusions

No real marketplace/distribution/payments, CPU/memory monitoring, production credential product, remote app routing, Observer or Automation wizard. No new build daemon/framework: reuse existing Tauri and pinned runtime/template artifacts. Keep catalogue polish bounded so E004 and the final video have time.

Completion advances E3; permissioned Automation and submission remain E4/E5. State platform evidence honestly, then review baseline/goal before E004.
