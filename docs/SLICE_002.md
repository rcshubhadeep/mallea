# Slice 002: a capability built from another app's evidence

State: complete for bounded functional acceptance; user confirms the native-edit/board-acknowledgement flow works. Follow PROJECT_PLAN.v006.md. Evidence is recorded in STATUS.md and REHEARSAL_002.md. The final timed submission recording remains later work.

## Goal and plan alignment

Turn the local panel-authoring proof into the central cross-app demonstration: a browser board builds a capability using approved evidence owned by a real Windows desktop notebook. A notebook edit changes the correct board review state without a page reload, while acknowledgements remain tied to exact revisions.

Primary milestones: complete the bounded Day 3-5 app identity, ownership, registry, and communication path; advance Day 6 capability-aware authoring and Day 7 event-driven review. Do not claim full agent lifecycle, background scheduling, or the final demo is complete.

Demo contribution: the same user's request creates a useful view of data from a different app, then an edit in that app affects the installed behavior. App developers expose contracts; end users compose what those contracts permit. The model must actually receive and use discovered capability information.

## Verified baseline and audit implications

- User confirms Slice 001's planned flow works. Nineteen automated tests, TypeScript, and both frontend builds pass after the unsupported-response fix.
- Real development probes support layout composition and computed revision-gap labels. A threshold policy was silently substituted before the fix; the repeated probe now returns unsupported. These observations are not a model reliability benchmark.
- Both current frontends use the same fixture store and package slot. The authoring context hardcodes production-board; the shared validator assumes an evidence panel. This is not yet independent app registration.
- Actual native generated-frame interaction remains unverified. Resolve it before building cross-app features around an untested native boundary.
- Retain existing validated packages and acknowledgements. Do not reset the user's workspace during development or migration.

## Work units and acceptance gates

| Unit | Work | Acceptance evidence |
| --- | --- | --- |
| W1 | Verify the actual Tauri window with the shared builder, service connection, and isolated generated UI. Inspect the existing native content policy; if needed, introduce a narrow compatible frame-delivery mechanism. | A generated or clearly labelled existing test package renders in the native window and its approved action works. Parent/native access remains unavailable. Do not solve a frame failure by disabling content policy or granting same-origin/native access. Record actual Windows evidence; browser notebook testing does not substitute. |
| W2 | Introduce app definitions and distinct ownership. Each definition supplies identity/type, slots, permitted data/action schemas, domain validation, and authoring context. Notebook owns observations/screenshots/revisions; board owns tasks, links, and acknowledgements. Scope package activation to its app. | Shared builder receives the selected app's definition, with no hardcoded board prompt. Old data migrates transactionally with a documented backup/compatibility path. Board cannot edit notebook-owned evidence through a board mutation. A package installed in one app does not silently install in another. |
| W3 | Add workspace registration, instance sessions, capability discovery, and scoped grants. Keep one local demo workspace. | Registry returns registered instances and versioned capabilities. No routing by hardcoded demo IDs. Unknown/cross-workspace instances and ungranted capabilities are rejected. A third synthetic instance proves selection and routing isolation without a third product UI. Explain local pairing/session limitations honestly. |
| W4 | Use an official, pinned MCP SDK for the gateway's basic discovery/read/call path, with outbound app connections for host-owned operations. Confirm SDK/version behavior at implementation time. | Real MCP discovery and one authorized notebook read work through the gateway. Board resolves linked observation by owner/instance/entity ID. Missing permission, unknown capability, and offline owner give actionable results. Record the protocol boundary; ordinary events are not described as MCP tool calls. |
| W5 | Connect model authoring to the discovered, permitted capability subset. Present requested cross-app access and the available behavior before installation. Keep feasibility refusal and bounded repair. | A real request uses the notebook capability description to author a panel with bound screenshot/text and executable review logic. Preview remains a copy, installation grants only declared access, and unsupported essential changes produce no claimed successful replacement. Check layout/behavior against the request, not just schema validity. |
| W6 | Add revisioned events over the outbound connection, with operation IDs, deduplication, host-owned review handling, and refresh on reconnect. | Editing notebook evidence updates only the linked board task; ordinary/critical behavior follows the installed policy. Duplicate or older events do not regress state. Acknowledging N cannot acknowledge N+1. Closing the panel does not remove the active host's subscription. Offline state is visible; reconnect refreshes authoritative data. |
| W7 | Execute the actual desktop-to-browser scenario, third-instance routing, permission failures, disconnect/reconnect, reload/restart, and one bounded direct Meta authoring milestone check. Update runbook/status. | All preceding gates have evidence. The model-authored capability reacts to a real native notebook edit; follow-up revision retains state. Both platform-specific commands and migration/reset steps are documented. Capture a short rehearsal and elapsed times; any edited waits must be identified. |

Track the current work unit in STATUS.md. Resolve W1/W2 before committing to routing assumptions; no silent expansion when a dependency fails.

## User acceptance walkthrough at handoff

Exact executable commands will be added to README as each implementation step becomes reproducible.

1. Start the trusted workspace service, real Windows notebook, and browser board using a fresh synthetic workspace or documented migrated workspace.
2. Confirm that the notebook shows an observation editor and the board shows its linked task, with distinct app identities.
3. In the board, request a review panel using the linked notebook evidence. Inspect the discovered source, preview, and requested access; install.
4. Acknowledge the current evidence. Edit the actual observation in the desktop notebook and save it.
5. Without reloading the board, see the new evidence revision and changed review state. Acknowledge it to clear the requirement.
6. Revise the policy through the builder and verify the ordinary/critical distinction and retained acknowledgement.
7. Disconnect/reconnect the notebook and restart the service. Observe clear availability feedback, refreshed authoritative state, and retained packages/data.
8. Run deterministic permission, wrong-instance, duplicate/stale-event, and third-instance tests. These should require no paid model calls.

## Scope, cuts, and unresolved decisions

- Include generic app contracts and routing, two actual runtimes, one linked-evidence workflow, and the existing two policies.
- Exclude proactive observer, learning nuggets, new policy thresholds, arbitrary forms/React generation, general workflows, multiple panel layouts at once, marketplaces, cloud deployment, P2P, full agent scheduling/history, and final video production.
- Use the existing single local service. Production multi-user identity and remote deployment are out of scope; workspace/instance scope must still be enforced in local tests.
- Choose the smallest supported SDK/connection design after checking official docs during W3/W4. Keep MCP, routing, authorization, and event delivery as explicit responsibilities.
- A third synthetic app proves generic routing, not universal app compatibility. Two domain-specific definitions are not proof of arbitrary app generation.
- If time is tight, cut cosmetic configuration and optional MCP features first. Preserve actual native participation, real model authoring, authorized cross-app access, event correctness, and state persistence.
- Confirm remaining hackathon time before implementation. If the scope cannot fit, revise the plan explicitly; do not quietly substitute two windows over the same local data for cross-app exchange.

## Next bounded generalization candidate

After this slice passes, consider a configurable revision-gap threshold. Define the normalized policy in the app contract, show its meaning and examples in preview, and independently check gaps 0, 1, threshold-1, threshold, threshold+1, old revisions, and both criticalities. Preserve legacy packages. Make metadata, generated code, and displayed behavior agree. Do not weaken isolation or let generated code define its own sole correctness oracle.

Promote this candidate only if core cross-app acceptance passes, the remaining schedule permits a bounded implementation/validation pass, and it makes the demo's follow-up more compelling. It remains unsupported today.
