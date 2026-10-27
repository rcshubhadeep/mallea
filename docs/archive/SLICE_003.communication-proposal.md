# Proposed Slice 003: complete the web-to-native-to-web loop

State: proposed, not started. Follow PROJECT_PLAN.v008.md. Supersedes the lifecycle-first proposal retained byte-for-byte in archive/SLICE_003.lifecycle-proposal.md.

## Goal and priorities

Deliver a compelling, testable closed workflow: a user extends the browser board to request a retest; the native notebook receives the request; its user records a result/new evidence; the board receives the result and updates its review state. The user sees software acquire a useful cross-app action at the point of use.

Every work unit must support the three-minute demonstration or one of the advertised tester workflows. Supporting contracts, access control, persistence, and checks are justified by those concrete acceptance cases. Broad management UI and unrelated generalization do not lead this slice.

Advances Days 5-7 bidirectional capabilities and authoring, plus Day 9 reproducibility. It does not complete the full agent lifecycle, observer, or final recording gate.

## Baseline and missing behavior

- Slice 002 native edit -> board evidence/review update is working and user-confirmed.
- The connection already carries traffic in both directions, but the implemented product flow is mainly notebook-origin evidence affecting the board. Reading an observation and receiving its reply does not prove a web-origin action changes the native app.
- Board acknowledgement changes board-owned state; it is not a retest request or native work item.
- Current SDK supports one review slot, fixed evidence bindings, one acknowledgement action, and two status policies. A retest form/action requires a bounded contract extension and validation; it is not currently available.
- Last verified baseline: 21 tests and TypeScript checking pass. Before implementation, repeat the status/source/goal/plan review and focused baseline checks.

## Explicit supported workflows

| Workflow | User-visible value | Required result |
| --- | --- | --- |
| Evidence review | Review notebook evidence inside the board instead of switching tools | Model-authored panel; correct source/revision; acknowledgement and revision-aware status |
| Request a retest | Turn a release concern into concrete work in the notebook | A second authoring request adds an editable instruction field and permitted remote action; sending creates a visible native request |
| Return the result | Close the loop where the evidence lives | Native user resolves the linked request with result/new evidence; board receives resolution and the new revision, which still needs its own review |

These are a few supported workflows within one coherent domain, not three claimed general-purpose app types. At least two materially different authored contributions must work: a read/review view and a cross-app action. Cosmetic variations alone do not satisfy this gate.

## Proposed demo spine

1. Show the two apps and the cost of moving evidence/requests by hand.
2. Ask Meta to bring linked evidence into the board; preview and install.
3. Follow up: Only block critical tasks; also let me request a retest in the notebook with editable instructions.
4. Preview/install the changed behavior and new action. Send a specific request from the web app.
5. See it arrive in the actual native notebook. Record the result there; see it return to the board, with a new evidence revision.
6. Show the installed version retained after reload. Keep concise Meta/model credit and the try-it entry point.

Measure this story against 180 seconds before adding the observer or more configuration. Label any compressed generation waits. The existing direct Meta/native run still requires final recording validation.

## Work units

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Fix the domain contract and user story: request identity, linked observation/revision, author/owner identity, editable instructions, open/resolved states, result, and required capabilities. Define the limited SDK additions and migration before coding them. | Two different user phrasings describe the same supported workflow. Typed resource/action contracts and independent expected outcomes are documented. Existing packages remain valid. New actions are explicitly unavailable until implemented. |
| W2 | Implement owner-routed request creation and resolution through the existing gateway/connection boundary. Persist request identity and operation results; enforce grants, ownership, workspace, and revision checks. | Web request produces a native-owned actionable item, not just an echo notification. Duplicate/retried operations create no duplicate work. Unauthorized writes fail; offline owners produce explicit feedback. Successfully delivered requests survive reload/reconnect. |
| W3 | Extend the bounded generated UI/bridge for an editable instruction field and declared retest action, with app-owned schemas. Keep preview effects separate from live actions. | A real model-authored revision adds the field/action and preserves the review behavior/state. The user can change the instructions before sending. Payloads and access are checked by the host; unsupported actions are rejected. Preview cannot send a live request. |
| W4 | Add a clear native request inbox/result path and board resolution/status display. Keep native evidence editing and board acknowledgement separate. | Request sent from browser is visible in the actual native window with the correct task/evidence/instructions. Native resolution returns the result/new evidence to the correct board task. A new revision is never silently acknowledged. |
| W5 | Finish the visible in-app authoring path, permissions, and scenario-specific controls. Implement only the lifecycle metadata/disable controls necessary to explain and control the new action. | Both initial and follow-up authoring work; active version/access/source are understandable; the remote action can be disabled/revoked. The old working package remains usable after a failed update. Do not build a broad management subsystem first. |
| W6 | Verify both directions, failure/recovery, request variations, and target Meta authoring; measure a functional rehearsal. | Actual native+browser sequence passes. Test wrong owner/workspace, missing grant, offline owner, duplicate request/resolution, stale revisions, failed package, preview isolation, reconnect/restart, and app installation scope. Run bounded development checks first and one focused direct Meta milestone check. Each advertised use case has deterministic evidence and a manual test path. |
| W7 | Provide a guided local try mode with minimal startup, fresh workspace/reset and clean stop, labelled saved artifacts from real validated generation, and optional configured live authoring. Update README/runbook and capture known limits. | A fresh tester can execute the advertised workflows without an inference key using labelled replay artifacts, then opt into live authoring with configuration. No fake generation animation or claim of live inference during replay. Test the actual native path separately; a browser-only frontend preview is labelled. No secrets enter bundles or sample packs. |

Track the active unit in STATUS.md only when implementation begins. Do not silently mark this slice started because the plan changed.

## Testable delivery and feature admission

The target is one documented local demo-start command after initial dependency setup, rather than several manually coordinated terminals. It should report health and stop its own children cleanly. The command does not exist yet. Preserve a Windows native executable/build path; Linux/macOS instructions must retain explicit verification status.

Retain real generated artifacts from already authorized validation runs with provenance sufficient to distinguish replay from live authoring. Test replay without keys. Live generation requires a configured inference endpoint. Reset must use a new isolated demo workspace or an explicit recoverable procedure; never delete the user's working data or credentials.

Admit a proposed feature only if it adds an understandable demo moment or makes a stated tester workflow reliable/reproducible. Route technical work to the corresponding acceptance condition. Keep feature freeze and the final two full days for rehearsal, recording, and submission.

## Deferred work

The broader lifecycle proposal remains recorded in the archive and overarching plan: rich inspect/history UI, scheduling variants, version restoration, and full created-agent records. Implement remaining lifecycle pieces after the bidirectional slice if they support the demo/tester path. The proactive observer is the next visible AI candidate, gated on this loop working and fitting the three-minute story. Learning nuggets still require the existing timing/value gate.

Exclude unrelated app domains, arbitrary React/native code, broad workflow orchestration, threshold policies, marketplaces, P2P, production deployment, and final video production from this implementation slice.
