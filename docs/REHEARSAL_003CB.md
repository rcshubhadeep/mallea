# Targeted malleability: 003C-B evidence

Date: 2026-10-29. Advances M1; this delivery establishes a targeted editing mechanism, not completion of the broader malleability gate or M2-M4. User acceptance pending. Active plan v018 records the priority before Observer.

## Implementation and fresh checks

- Fresh baseline: 32 tests and TypeScript passed before edits. Final: 36 tests and TypeScript pass; both frontend builds and Windows release build passed. Final backend enforcement was tested afterward; no native/frontend runtime edits followed the build. Linux/macOS untested.
- Added bounded ordinary typography/presentation and a shared set/insert/move/remove transform over stable node IDs. The transform works on a copy and validates the final Surface. New Surface inference jobs must return operations, rather than regenerate the app. Stored full artifacts/legacy SDK authoring remain compatible. No new dependency, property-path interpreter or arbitrary CSS/code execution.
- Tests check exact preservation outside a bold style/version change, independent insertion/movement/removal, retained fields, rejected cycles/root/unknown targets/authority escapes, normal activation and stale-version rejection. A regenerated full app is rejected by new authoring after bounded repairs, leaving the installed state unchanged.
- Exact user bold-list request passed development and direct Meta service authoring on attempt 1. Each returned one Update versions: style operation. An additional offline equality check on retained artifacts confirms that metadata/permissions/layout/bindings are unchanged except the required version and requested list weight. The exact service check is reproducible with scripts/verify-malleability.mjs.
- Actual Windows native builder received the same original request. Ready on attempt 1, proposed one style edit, preview showed bold repeated text while live remained unchanged. Approved existing access, installed Fieldnote studio v1.0.2; list text became bold. Canvas, inspector, saved revision 3, note and read feedback stayed intact. Closed/reopened the release app; bold text persisted. Local screenshot: ignored .mallea/screenshots/slice003cb-bold.png. This native authoring used development inference, not a direct-Meta native recording.
- Fresh development note insertion under enforced operation-only authoring passed attempt 1: Add local-notes-panel to design-stage. Local value saved successfully while saved design data remained equal. Service-only check, not actual native note-addition interaction for this delivery.

## Inference accounting and limits

| Check | Responses | Tokens | Reported cost |
| --- | --- | --- | --- |
| Exact bold service / development | 1 | 9,500 | 0.013099 |
| Actual native bold / development | 1 | 9,666 | 0.0138045 |
| Web note + refinement, exploratory check | 3 | 38,568 | 0.084066 |
| Enforced targeted desktop note insertion | 1 | 10,624 | 0.017876 |
| Development total | 6 | 68,358 | 0.1288455 |
| Direct Meta exact bold service | 1 | 9,323 | Not returned |

Exact bold elapsed time: development service 3,141 ms; direct Meta 3,628 ms. New targeted note insertion 14,066 ms. No automatic production fallback or unbounded paid loop.

The exploratory web insertion first hit the 6,144 output-token ceiling and repaired successfully on attempt 2; refinement succeeded on attempt 1 and retained the note. That verifier did not yet record change summaries, so it does not establish whether both responses used operations or full-artifact compatibility. This accounting gap motivated strict operation-only new authoring plus explicit operation/diagnostic recording in verify-local-surface.mjs. Do not count the earlier result as proof of enforced targeted web insertion. No extra production rerun was made.

## User test and remaining acceptance

The updated companion and rebuilt native app are left running. Do not start a second companion on port 4318. Stop project service/previews and close native windows before npm ci. Source-run/build instructions and parallel platform commands are in root README.

1. Inspect Fieldnote's already-installed bold saved-version list. Confirm the canvas, saved revision/note and other controls remain in place.
2. In Shape this app ask: "Make the saved revision list normal weight. Keep the layout and everything else unchanged." Build, inspect the one localized change and separate preview, approve/install. The list should return to normal weight.
3. Reapply the original bold request. The list should become bold; closing/reopening should retain it. Each deliberate generation can incur inference cost.
4. To test a different category, add a separate local notes panel while preserving existing sections. Type/save text; request moving that same panel, then removing only that panel. Inspect each preview. Existing document/palette/other additions should remain; removing UI retains stored local fields. These broader actual-user cases remain a gate, not claimed completed from deterministic tests.

Remaining: easy direct element/contribution selection, independent contribution management, undo UI, wider semantic/visual acceptance across typography/additions/rearrangement/working actions and both hosts. No Observer work until the bounded malleability gate is accepted. Native canvas internals still use registered app actions; no promise of unrestricted visual/code changes.

README reviewed and updated for current typography, targeted edits, reproducible verifier and limits; no internal slice/work-unit tracking added to the product-facing README. Final shared-file, link, immutable-snapshot and whitespace checks recorded in STATUS.md.
