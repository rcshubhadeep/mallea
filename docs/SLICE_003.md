# Slice 003: first working Surface in two distinct apps

State: defined, implementation not started. Milestone M1 in FOUNDATION_PLAN.md and PROJECT_PLAN.v012.md. The prior broad proposal is preserved byte-for-byte in archive/SLICE_003.live-model-proposal.md.

## Outcome and baseline

A designer annotates an image in an actual desktop scratchpad, asks the builder to bring annotation color into the working canvas layout, previews/installs the model-authored Surface, uses it and reopens without losing it. The local web review board looks like a different product and displays a permitted saved design revision. This first data direction is not completion of bidirectional M2/M3 acceptance.

Before implementation read STATUS.md, the active plan's goal/detailed sections, FOUNDATION_PLAN.md and DEMO_PLAN.md; inspect SDK review constants, runtime branches, builder, registry, storage and native config. Planning-turn fresh Windows baseline: 21 tests and TypeScript checks passed; native-build/UI/Meta evidence remains historical. Revalidate at implementation start. Preserve existing tests and user data; new demo uses isolated seeded storage, not destructive migration.

## Numbered work units

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1: working visual core | Assess Fabric.js behind a small adapter, capped at roughly two hours. Display bundled image, edit/select one text annotation, set color through callable action, dispose/reload canvas and export PNG. Use native color input. | Real annotation visibly changes and export reflects it. Library internals stay outside Mallea contracts. Record version/license. If fit requires invasive adaptation, choose smaller library or narrow Canvas 2D and record reason; stop comparison once fit passes. |
| W2: distinct apps and saved data | Scratchpad and Review Board definitions plus small linked synthetic dataset in existing storage. Register needed typed resources/actions and grants; snapshot image/note on Save revision. Give apps distinct shells. | Actual native canvas/note/save works; local web starts with older linked asset and can explicitly refresh permitted saved image/note. Unsaved edits are not published. Domain rules stay in adapters; shared dispatch consumes registrations. Old review data untouched. IDs/revisions here; hashes/receipt in 005. |
| W3: small live model | Versioned composable workspace: stack/split/grid, text/image/button/input/textarea/color/repeat, approved trusted canvas reference, schema-backed bindings/actions. Extend existing isolation/bridge/validation. | Move/group canvas and working controls; preview never writes live data. Invalid nodes/paths/actions fail before activation. Fixed shell/canvas are trusted; model composes layout/control definition. Tiny alternate-schema fixture uses shared dispatch without domain branches; no third polished app. |
| W4: real authoring/install | Feed workspace/selection/registered schemas into existing bounded builder. Generate/validate/preview/approve/activate Surface through existing immutable version storage. Support feedback/refinement and disable. | Real development model authors working color/workspace Surface. Follow-up changes grouping/placement/label while retaining image/note and compatible draft state. Failed/stale proposal preserves installed app. No intent switch selects finished screens. Restore compatible version only if existing storage makes it small; no migration UI. |
| W5: native/browser evidence | Focused permission/binding/preview/stale/restart tests and actual Windows Tauri/browser run. After development success, bounded direct-Meta authoring/refinement milestone check. | Native Surface works and persists across reopen/service restart; browser reads permitted saved image/note. Record actual usage/timing/model; distinguish service-only Meta check from native walkthrough. Denied access leaves prior asset intact. |
| W6: reproducible handoff | README exact prerequisites/config/start/build/stop/new walkthrough, parallel Windows/macOS/Linux instructions and tested/untested labels. Reuse scripts; do not build installers here. | Another checkout has documented source-run path for new apps; distinguish legacy flow. Exact user steps, outcomes and limits supplied. Record README review and platform evidence. Final launcher/sample polish in 005/006. |

Set W1 active in STATUS only when implementation starts; keep current unit/state updated. Each unit serves visible functionality or the handoff.

## User test at completion

Follow the exact commands/labels added to README in W6 (no future command is advertised as working now). Open actual native Scratchpad and local Review Board. Change color via Edit, enter note and Save revision. Ask builder to put annotation color beside canvas, preview/install/use, then refine placement. Reopen and verify contribution/saved data remain. Approve linked read and refresh web card; image/note match saved revision. Deny access: old asset intact. Preview interaction must not change live color/saved revision. Record user feedback separately.

## Exclusions/report

No Observer yet, load-trigger Automation, feedback return Surface, general agent scheduler, hosted-site bridge, full graphics editor, schema migrations, new plugin ecosystem or installer parity. M1 passes only with functional native model-authored transformation and reproducible handoff; M2-M4 remain incomplete. End with milestone/passed acceptance/incomplete report and mandatory README gate. Stop identified project previews before dependency changes.
