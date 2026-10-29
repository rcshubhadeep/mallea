# Slice 003C: useful apps that users can extend

State: defined; W1 complete, implementation not started. Follow PROJECT_PLAN.v016.md, FOUNDATION.md and FOUNDATION_PLAN.md. Advances broader M1 composition and the feedback-return part of M2. Prior narrow M1 acceptance is retained; it does not establish these new features.

## Goal

A normal minimal app works without invoking the builder. While using it, a person can add working controls/data, rearrange its workspace, and revise/remove an individual addition while preserving other work. Agents use registered data/actions across apps with explicit permissions. This must remain a small composition language, not a collection of finished workflow recipes.

Fresh W1 baseline: inspected current renderer, app definitions, local state and install boundary; 30 tests and TypeScript pass on Windows. Existing Surface authoring replaces one workspace definition and supports one global disable. Generic local text/color persistence exists. Targeted independent additions and value-bearing choice controls do not. Previous native/build evidence is historical, not a fresh build in this planning step.

## Numbered work units

| Unit | Scope | Acceptance |
| --- | --- | --- |
| W1 | Verify baseline/goal; revise immutable plan and define scope | Fresh baseline recorded; v015 unchanged; v016 localized insertion verified. Complete. |
| W2 | Define and implement minimal stable contribution identities/ownership and bounded changes to the existing app model; choice control and typed literal action arguments | Add/edit/move/remove can address one contribution; unrelated content/state retained, stale/invalid changes rejected atomically. Five colors are ordinary choices bound to registered annotation action, not a special palette handler. Fix exact grammar before edits; reuse renderer/version/SQLite and preserve existing work. |
| W3 | Shared builder target selection, preview and installation; simple per-addition removal | User can request a new addition, select one to refine/remove, or explicitly rearrange the workspace. Preview shows affected area and does not persist edits. Existing workspace remains usable, stable field keys preserve values. Same mechanism in web/native. No full plugin-manager UI. |
| W4 | Minimal ordinary-app baseline and useful two-way capabilities | Keep existing canvas annotation/saved revisions and asset review as normal tools. Add the already-planned web feedback read/add adapter and permit a user-authored desktop feedback contribution. Native saved design updates web, web feedback appears in desktop; each app owns/renders its UI. Grant denial/offline failure does not destroy existing work. No wider editor features. |
| W5 | Focused regression, real authoring in both hosts, bounded target-Meta milestone check, documentation/handoff | Add color choices and notes; revise/remove one while preserving the other/document; rearrange; reload/reopen; both data directions work. Record actual model outcomes/usage, request mismatches and platform limits. README gate and exact user tests complete. |

Keep STATUS.md current at work-unit switches. A unit is complete only after its acceptance passes; this table is a plan, not an implementation claim. Start development inference first; reserve one bounded direct-Meta milestone check after development acceptance. No automatic production fallback or unbounded generation batches.

## Target acceptance walkthrough

1. In the normal starting Fieldnote, edit annotation/color/note and save a revision without opening the builder. Parcel can display the permitted saved asset and accept ordinary review feedback once implemented.
2. Ask for five named color choices using #00C000, #FFEB00, #0066FF, #FF0000 and #000000 beside the canvas. Preview/install; selecting a choice changes the actual annotation through the existing action.
3. Add a separate notes contribution with a new multiline field, leaving the palette/base app intact. Save different local text in each app.
4. Target only the palette for a placement/label change. Notes and artwork remain intact; the palette still works. Remove only the notes contribution; palette remains. Retained local data is not silently deleted; hiding/removing UI is distinct from destructive data deletion.
5. Explicitly rearrange the workspace and reopen/reload. Saved app data and remaining contributions persist. Invalid/stale proposals leave the prior version intact.
6. Save native artwork and update Parcel through existing approved capability. Add web feedback and author its desktop display using permitted reads; verify grant denial/offline cases. No view-tree transfer or unrestricted agent access.

These are varied acceptance probes, not code branches selected by keywords. The engine must consume declarations, bindings, stable targets and action references. Meaningful natural-language compliance is checked separately from schema validity.

## Exclusions and schedule

No Observer implementation in this slice; it follows after this foundation. No full graphics editor, multiple documents, third polished app, arbitrary JavaScript, general expression/patch engine, schema migration framework, production identity, new transport or visual synchronization. Publishing-on-load Automation remains Slice 005. No new dependencies unless existing supported APIs demonstrably fail a concrete requirement. Reuse existing libraries behind adapters.

Protect November 2-3 for freeze/rehearsal/video/submission. Keep one compact extension experience; cut optional management/decorative controls first, not either communication direction or point-of-use transformation. Report milestone advanced, exact acceptance passed and remaining work. README remains product-facing; these tracking details stay in docs.
