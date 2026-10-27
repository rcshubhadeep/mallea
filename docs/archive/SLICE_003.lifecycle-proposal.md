# Proposed Slice 003: inspect and control what you created

State: proposed, not started. Scope derives from lifecycle requirements already present in PROJECT_PLAN.v007.md. No new architecture or model-budget decision is introduced by this proposal.

## Goal and plan alignment

Let users understand and control an installed capability: inspect its purpose, access, source app, active version, and recent activity; pause/resume it; restore a compatible validated version without losing app data.

Advances Days 6-7 and the lifecycle acceptance gate. This provides the minimum ownership experience for first-class created capabilities before the Day 8 observer recommends them. A saved record does not by itself establish autonomous AI execution.

## Starting evidence

- Slice 002 native-edit / board-acknowledgement flow is user-confirmed.
- Fresh progress-review baseline: 21 tests and TypeScript checking pass.
- Installed packages and immutable versions persist, but there is no purpose/trigger/activity record, pause/resume control, or restore UI.
- Before implementation, re-read status, inspect source, read the overarching/detailed plan, and rerun focused checks; the proposal is not a substitute for that review.

## Work units

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Define a minimal persistent capability record with app ownership, user request/purpose, declared access, linked source, execution type, trigger description, active version, and enabled state. Migrate existing installations with a backup. | Existing installations/data survive. Describe the current trigger honestly as host-derived review on workspace/evidence refresh; do not invent a schedule or autonomous behavior. Model-generated descriptions are not authority to grant access. |
| W2 | Add an inspect/manage surface shared by both hosts, plus pause and resume. Explain unavailable/disabled controls, including already-reviewed evidence. | Pausing stops this capability's review contribution and actions while retaining its code, data, and host-owned source connection. Resume rechecks current evidence and access. Both states survive restart and affect only the selected app. |
| W3 | Restore a compatible earlier validated package version. Keep immutable versions and monotonic numbering for later new revisions. | Restore changes code, preserves observation and acknowledgement state, rejects incompatible/unvalidated versions, and does not silently broaden grants or enable a paused capability. Failed restore leaves the active version intact. |
| W4 | Add bounded activity/provenance records for creation, revision, activation, pause/resume/restore, and relevant review outcomes. | Distinguish model authoring from deterministic execution. Deduplicate ordinary refresh noise, bound retention, and avoid logging credentials or full evidence text. Paused capabilities do not claim successful runs. |
| W5 | Verify lifecycle, migration, state retention, permissions, app isolation, and native/browser controls; update README/status. | Focused deterministic checks plus one actual native/browser walkthrough pass. Use existing generated packages for routine checks. A bounded direct Meta check is warranted only if authoring/context behavior materially changes. Give exact user test instructions and report remaining scope. |

## Exclusions and handoff

Exclude autonomous scheduling, additional tools/domains, threshold policy expansion, observer inference, learning nuggets, and final video production. Observer implementation is the following candidate slice after these controls work; its proposal already exists in the active plan.

At handoff, users should be able to inspect a capability, pause it, change source evidence, resume against current evidence, restore an older version, and restart without losing state. Report the milestone advanced, conditions passed, and incomplete larger goals. Do not silently start the observer within this slice.
