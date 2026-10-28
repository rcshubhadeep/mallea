# Progress review after user acceptance of Slice 002

Historical review. Subsequent recommendations below are superseded by PROJECT_PLAN.v012.md, FOUNDATION_PLAN.md, DEMO_PLAN.md and SLICES.md: 003 first working Surface, 004 Observer/feedback, 005 Automation/runnable handoff, 006 submission. Existing mechanisms remain reusable; no new runtime support is claimed.

Date: 2026-10-27. Active overarching plan: PROJECT_PLAN.v007.md.

## Evidence and current position

The user confirms the native observation edit / board acknowledgement flow works. This supplements the automated and agent-operated evidence; it does not attribute every automated failure/recovery case to the user's manual run.

Fresh checks for this review: all 21 automated tests and TypeScript checking pass. Frontend/native builds and direct Meta checks remain the recorded Slice 002 evidence; no new build, UI rehearsal, or inference call was needed for this review.

| Goal | Current position |
| --- | --- |
| Change running software through natural language | Working within the evidence-panel contract: generate, preview, install, revise |
| Shared web/native foundation | Shared runtime and builder used by browser board and actual Windows notebook |
| Useful cross-app collaboration | Authorized evidence reads and native edits update the linked board task; reconnect and persistence verified. Revision changes are detected; old/new content highlighting is not implemented. |
| Substantive Meta participation | Meta has passed real package creation and revision; installed code then handles deterministic review logic |
| First-class created agents | Partial: persistent packages and access exist; purpose/trigger/run records, pause/resume, and version restoration are missing |
| Proactive software improvement | Observer is planned and unimplemented |
| Three-minute compelling submission | Working functional story exists; final target-Meta/native recording, timing, polish, and submission materials remain |

This advances the bounded Days 3-5 identity/ownership/communication path and parts of Days 6-7. The overall project and final demo gate remain incomplete. No completion percentage is claimed.

## Generality: reusable mechanism versus domain assumptions

| Layer | Reusable today | Remaining specialization |
| --- | --- | --- |
| Shared shell/builder | Both hosts use one request/progress/preview/install/revision flow | App UI still branches between board and notebook; builder preview assumes tasks |
| Inference adapter/authoring loop | Configurable endpoint/model, cancellation, bounded repair, refusal | Generated programs must fit SDK 0.2 review packages |
| Package lifecycle and isolation | Per-app immutable versions, separate preview state, persistence, iframe bridge and bounded interpreter | Single slot, fixed bindings/action/permissions, two allowed decision policies |
| Registry/connections | Instance IDs route reads without selecting a hardcoded pair; scopes, presence, reconnect | Registration recognizes the current known app types; local trusted-workspace identity only |
| MCP gateway | Official protocol/SDK used for discovery and calls | It explicitly registers read_observation; arbitrary tools cannot be added solely through an app descriptor |
| Domain/storage | Ownership and linked revisions are enforced | Tables/state methods understand tasks, observations, notebook kinds, and review acknowledgement |

The two app definitions improve separation and supply real authoring context. They do not yet isolate every domain assumption. For example, packages/sdk/package.mjs fixes task.details, review.acknowledge, observation bindings, and two policies; gateway.mjs fixes the observation tool; collaboration-store.mjs knows notebook/board data shapes.

A third notebook instance proves generic instance routing and isolation. It does not prove a third unrelated app domain. Adding an expense app, calendar, or inventory tool today requires changes in shared SDK/service code as well as a new app definition.

The model writes actual layout and JavaScript within the available vocabulary. Proven variations include content order, styles, headings, and computed revision-gap labels. The three-revision blocking request remains unsupported. This is a specialized implementation with reusable framework mechanisms, rather than a completed general app framework.

The authoring agent currently reasons while generating/repairing a package. Installed review logic reacts deterministically. There is no general autonomous agent selecting tasks/tools during ordinary app use, and no model call on each evidence event. Keep these roles explicit in the video.

## Recommended next step

Corrected by the user's subsequent clarification: the intended MVP limit is a small UI/layout/operation vocabulary, not a fixed menu of workflows. Point-of-use software modification and bidirectional capabilities must develop as one framework foundation. The v008 retest/communication-first interpretation was too narrow and is superseded by FOUNDATION.md and plan v009.

Proposed Slice 003 now targets a persistent live app model for a meaningful mutable working surface, a shared renderer/binder over a small vocabulary, registered resource/action schemas, and real model-authored recomposition in both hosts. Local and remote actions use the same invocation boundary under explicit permissions. Current review-specific code is a compatibility input to that work, not proof the generalized model already exists.

The demo should show the browser and native apps each change shape during use, then exercise their authored controls in both directions. A retest flow remains only one possible example, not a subsystem to build instead of the framework. A tiny unrelated contract fixture should test reuse without adding a third polished product.

The Observer is the sole predefined agent type and a target framework feature, still unimplemented. The always-present builder is a capability, not a second resident agent. It should create runnable user agents with bounded execution and view outputs, in addition to composing interfaces. Future classic-app adapters may supply approved data/actions through the same contracts; no such integration is implemented. Spreadsheet and word-processor examples illustrate that architecture and do not expand the products being built.

The actual component/layout vocabulary is fixed in the contract spike. Preserve the guided try path, honest saved-artifact replay, and the final two full days for rehearsal/recording/submission. The observer can later inspect this same environment and suggest a composition change; it should not require a separate bespoke product flow.
