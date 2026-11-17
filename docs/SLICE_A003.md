# A003: action invocation policy

Third A2UI-inspired Core slice, authorized November 17 after the user's successful A2 notes-app test. Advances E2/E4 under unchanged plan v030. Work proceeds directly on main.

## Numbered units and acceptance

| Unit | Scope | Acceptance |
| --- | --- | --- |
| A3.1 | Inspectable policy contract | Action nodes may declare invocation with callers drawn from user/agent/automation and requiresUserGesture. Validate unknown/duplicate callers and malformed declarations. Registered action contracts may impose a ceiling; node declarations cannot widen it. Publish effective policies in inventories/resource discovery and authoring schemas. |
| A3.2 | Core and owner enforcement | Assign caller identity inside Core: authenticated live events are user interactions, MCP action tools are agent calls, and Automation action calls are automation calls. Clients cannot supply identity/gesture in event/tool/owner-request payloads. Check policy before effects, alongside existing app/Surface grants, and recheck the current policy at owner execution and after routed calls. A triggered Automation does not inherit the triggering click's gesture. |
| A3.3 | Compatibility, regression and handoff | Missing policies freeze existing defaults: user access remains; only data.set/collection.append/collection.clear retain their existing non-user action eligibility. Other generic actions require an explicit approved policy to enable non-user invocation. Keep legacy grant hashes when policy is absent; explicit policy changes require fresh action-grant approval. Persist declarations without resetting saved data/Automations. Test HTTP/MCP/owner paths, denial before effects, caller forgery, tightening/revocation, install replay, persistence and legacy defaults. Run full regression/type/build checks and README review. |

Example: a button may declare `"invocation":{"callers":["user"],"requiresUserGesture":true}`. Empty caller lists disable invocation. A policy requiring a user gesture cannot allow non-user callers. Existing explicit proposal preview/approval governs authoring changes to app-owned declarations; declarations are never permission grants.

## Boundaries and exclusions

The user-gesture requirement means the registered authenticated user-event path in this local trusted-host design; it is not hardware/OS attestation or a production hostile-app security claim. MCP and Automation invocations never receive that gesture context. Registered adapter actions remain behind their existing trusted host boundaries; no arbitrary execution bridge is introduced. Runtime Shape tools remain draft-only. A button invocation policy governs that action, not every possible change to the underlying data: separately declared resource reads/writes still use their own typed app/Surface grants. No new scheduler/workflow, A4 accessibility, remote transport, ecosystem work, credential migration or paid inference.

## User test after implementation

1. Stop the previous Core and start the updated source build with `node scripts/mallea.mjs run` from the repository root (PowerShell or Bash/Zsh). Configure the single Core model if needed.
2. In a notes app, choose Edit the whole app and ask Shape: Keep my notes and layout unchanged. Make the Add note action usable only by me through a direct interaction, and unavailable to tools or Automations. Do not execute the action. Preview the proposal and inspect its action declarations before approving.
3. Verify direct Add behavior and saved notes still work. Inspect app/resource metadata: policies should list permitted callers and the gesture requirement. Existing Automations that write declared fields should continue under their existing grants.
4. Automated MCP/owner tests establish non-user denial and approved caller behavior; the current Automation wizard does not gain a new action-step editor in this slice. Do not interpret a clickable button or an installed Automation alone as proof of every caller-denial case.

Fresh acceptance and user feedback are recorded separately in STATUS.md. macOS remains deferred. New API declarations do not imply remote interoperability or a new installed package release.
