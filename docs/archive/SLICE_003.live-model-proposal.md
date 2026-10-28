# Proposed Slice 003: compose the running application

State: proposed, not started. Follow PROJECT_PLAN.v011.md and FOUNDATION.md. This replaces the communication-first proposal retained byte-for-byte in archive/SLICE_003.communication-proposal.md; the earlier lifecycle proposal also remains archived.

## Core objective

Prove a new application-framework primitive: a running app has a persistent, inspectable model that its always-present builder can reshape at the point of use. Interface composition, data bindings, behavior, user-created agent definitions, and permitted local/remote actions belong to that model. The Observer is the sole predefined agent; the builder is a capability, not a second resident agent. Bidirectional capabilities expand what users and their created agents can compose; communication and malleability must be demonstrated together.

Bound the building language, not the high-level user workflow. A small set of UI components/layouts and schema-checked operations is acceptable. Named recipes for evidence review or retest are not the desired framework boundary.

Cross-app payloads carry data/state/events and permitted action requests/results. Both apps compose and render their own interfaces. Remote visual-element transfer, view-tree sharing, embedding, or UI mirroring is excluded; shared framework code and evidence images as data are unaffected by this boundary.

This advances the framework/SDK, authoring, and cross-app milestones from Days 2-7. The goal is a working shared mechanism and an ambitious visible transformation within the deadline, not a general OS/kernel or unrestricted code execution.

## Verified starting point and gap

- The existing framework mechanisms work: shared builder, model-authored review packages, isolated rendering/behavior, immutable versions, persistence, scoped owner reads, and actual native/browser event flow.
- Latest verified baseline: 21 tests and TypeScript checking pass; Slice 002 native-edit/acknowledgement flow is user-confirmed. Re-read status/source/goal and rerun focused checks before implementation begins.
- The current host body is hand-built around notebook/board branches, and the SDK fixes a review slot, field paths, acknowledgement action, and two policies. It cannot recompose the main working surface from registered schemas.
- The gateway exposes a fixed observation tool. App adapters exist, but the engine still contains domain assumptions. This is the specific gap this slice addresses.

## Work units and acceptance

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Define a minimal versioned live app model: main mutable working region, view tree/layout/appearance tokens, schema-backed resource references, selection/form state, derived behavior/actions, and user-created agent definitions/authority. Reserve the only predefined agent identity for the Observer. Fix a small primitive/layout/execution vocabulary and a legacy compatibility path. | Document grammar, examples, schema constraints, state ownership, and independent expected outcomes before coding. Preserve old packages/data. The model may recompose a meaningful working region. A minimal created agent declares purpose/instructions, approved inputs, explicit trigger, bounded model execution, and typed output/UI binding; do not claim autonomy from metadata alone. |
| W2 | Build a shared model-driven renderer and binding/state engine for both hosts. Resolve paths against registered schemas; support repeated data, selection, editable fields, and permitted derived values within the small grammar. | Change list/detail composition, add/remove/reorder supported controls, and retain authoritative data plus compatible selection/input state. The renderer has no notebook/board/evidence branches. Unsupported nodes/paths or malformed derived output fail before activation. Use existing isolation boundaries. |
| W3 | Expose app-adapter resources/actions through a generic capability catalogue and host bridge. Use one invocation contract for local and remote actions; keep existing MCP/connection responsibilities. | Field and action names come from trusted registration, not core SDK constants. Browser-origin edits/actions visibly affect native-owned state, and native-origin actions visibly affect board-owned state. Validate args, owner, workspace, entity, and grant on each call. Keep domain-specific persistence and invariants in adapters. |
| W4 | Connect the builder capability to the live model, current selection, schemas, and capability catalogue. Produce a validated proposal, preview, and atomic activation. Support a stripped-down user-created agent execution path using declared inputs and output bindings. | Real Meta-powered authoring changes composition/bindings and can create a runnable user agent with an explicit trigger and bounded model call. Its output appears in an app view. A follow-up changes the app again without losing data. No intent switch selects a prewritten final screen. Failed/stale/unsupported proposals preserve the current model; preview never performs live remote writes. |
| W5 | Express the notebook and board working surfaces through the same mechanism. Keep their seeded domain data and domain-owned actions. Choose concrete requests that demonstrate different compositions and both action directions. | One request reshapes the browser around data/actions from the notebook; a different request reshapes the native app around a permitted board action. Show each UI transformation before exercising its cross-app effect. The scenario can change, but it cannot require a workflow-specific engine branch. |
| W6 | Validate composition breadth within the vocabulary and failure/recovery. Add a tiny unrelated contract fixture, not a third polished product. Run actual native/browser and bounded model checks. | The same renderer/binder/action mechanism handles unrelated field/action schemas without engine edits. Test at least two materially different compositions plus alternate wording, invalid bindings/actions, denied access, preview isolation, stale proposals/revisions, failed updates, restart/reconnect, and app isolation. Development checks precede a focused direct Meta milestone check; do not claim universal generation. |
| W7 | Provide a guided try path, retained real-generated samples with provenance, and optional live authoring. Document the supported vocabulary, known limits, setup/reset/stop, and a measured three-minute demo spine. | Testers can replay labelled real artifacts without a key, and try their own requests with configured inference. Actual native acceptance is distinguished from a browser-only preview. Reduce startup friction and preserve user data. Keep model attribution and any time compression accurate. |

The proposed initial vocabulary may include text, image, badge, button, text input, toggle/select, and repeated items, with stack/split/grid layouts. W1 fixes the exact schema from feasibility evidence; this illustrative list is not an implementation claim.

## Example transformations, not fixed recipes

Browser: put tasks and selected playtest evidence side by side, surface changed evidence, and add an editable control that calls an approved notebook action.

Native notebook: add a control to flag a linked task as release-critical on the board while recording an observation.

The actions must first exist in registered app schemas and be explicitly granted. Neither remote action is currently implemented through the generic model. Alternative compositions using the same vocabulary must also work. A retest inbox can be an example later; it is not the product to build in place of this framework.

## Demo and completion gate

The viewer should see two applications acquire new structure and useful controls through natural language, then see those authored controls act across app boundaries in both directions. A prebuilt messaging workflow alone fails the gate. A visual rearrangement with no meaningful data/action binding also fails it.

The tester should be able to inspect the published vocabulary, run the examples, and attempt another supported composition. Clearly explain boundaries without implying support for arbitrary apps, OS operations, or unregistered capabilities.

Report the plan milestones advanced, actual acceptance evidence, remaining limits, and exact user test steps. Track work units in STATUS.md only when implementation starts. The final two full days remain reserved for clean setup, target-Meta/native rehearsal, recording, editing, and submission.

## Deferred scope

Defer a kernel/OS build, arbitrary native/dependency execution, broad autonomous scheduling, generic multi-user identity, a marketplace, and additional polished applications. Minimal ownership/version/access controls remain necessary around app mutation. The Observer is the sole default-agent target; implement its real usage-pattern suggestion flow after this composition/agent-execution foundation, through the same builder. It is not a separate optional product. Classic-app connector implementations remain future work, but registered resource/action interfaces must leave room for them. Spreadsheet and word-processor examples are illustrative, not products to build. Learning nuggets retain their timing/value admission gate.

At slice completion, review the root README and update changed behavior, limits, setup, run/test steps, and platform evidence. If no update is needed, record that explicitly in STATUS.md. This documentation check is a completion gate.
