# Implementation status

## Active slice

- Last completed slice: 002, bounded evidence flow. Next: 003, M1, distinct apps and first working model-authored native Surface; see SLICE_003.md and SLICES.md.
- State: Slice 002 functional flow user-confirmed. New planning/handoff complete; Slice 003 implementation not started.
- Current work unit: no active build unit. Slice 003 W1 (library fit/canvas) is next only when implementation starts; baseline/status/goal review required then.
- Plan alignment: bounded Days 3-5 identity/ownership/communication path; progress toward Days 6-7 capability-aware authoring and revision. Full agent lifecycle and final demo gate remain incomplete.
- Baseline at start: 19 tests and TypeScript checking passed. Final: 21 tests, TypeScript, both frontend builds, and Windows native release build pass.
- User confirmation: Slice 001 planned flow worked; Slice 002 native edit makes the board acknowledgement available and the flow works. Other failure/recovery gates retain agent-operated and automated evidence rather than being attributed to the user.

## Current state

- Distinct notebook/board app definitions, ownership, and app-scoped packages are implemented. The notebook edits observations; the board owns linked tasks, criticality, and exact-revision acknowledgements.
- Local registry tracks app instances, sessions, presence, and scoped grants. Runtime MCP calls use the official SDK gateway and route owner reads over outbound WebSocket connections. External local clients can use Streamable HTTP at /mcp.
- Discovery grants no access. The user allows linked notebook reads; calls check workspace, capability, owner, link, and grant. Tests include successful third-instance routing plus denied wrong-instance/cross-workspace calls.
- Shared authoring receives the app definition and actual MCP discovery result. It supports initial generation, bounded repairs, refusal, preview, install, and follow-up. The SDK remains specialized to review panels and two policies.
- SQLite migration first creates a consistent backup. Per-app versions, drafts, active pointers, grants, observations, task links, acknowledgements, and deduplicated edits persist. The live rehearsal used a separate database; the user's default database was not changed.
- Native frame data binding and acknowledgement are verified in the actual Windows window after replacing srcdoc with short-lived service frame URLs. The opaque sandbox and narrow bridge remain enforced; no raw native access is exposed.
- Real native notebook edits update the browser's evidence and review state without reload. Owner offline feedback, reopen recovery, and service restart with automatic client reconnect pass. Host-derived review state does not depend on a mounted frame.
- Revision changes are detected, but old/new text or image highlighting from the broader demonstration request remains incomplete; the current panel displays the latest evidence.
- Local bootstrap/session pairing is not production multi-user identity. The source must be online for cross-app reads. Linux/macOS, a final timed Meta/native recording, full agent records/scheduling, disable/rollback UI, observer, and learning nuggets remain incomplete.

## Next actions

1. Native-edit/board-acknowledgement walkthrough is user-confirmed. Record any further user feedback separately from automated checks.
2. Before the next slice, re-read this status, FOUNDATION.md, and the overarching goal/detailed plan v012 and FOUNDATION_PLAN.md/DEMO_PLAN.md; inspect source and revalidate the accepted baseline.
3. Submission target: November 4, 2026, morning Eastern Time, supplied by the user with roughly nine days remaining. Reserve the final two full days for freeze/rehearsal/recording/submission; exact cutoff hour remains unspecified.
4. Approved scenario: visual scratchpad and differently styled local asset-review board. 003 delivers working Surface; 004 Muse Observer/feedback return; 005 publishing Automation/receipt/try delivery; 006 validation/video/submission. Previous broad 003 archived byte-for-byte. No new implementation started.
5. No further production calls are required for Slice 002. Final submission still needs an actual native/browser rehearsal and recording with the target Meta configuration.

## Pending facts

- Exact cutoff hour within November 4 morning Eastern Time, submission requirements, and model eligibility rules.
- Direct Meta available budget and rate limits; basic model ID and chat-completions compatibility are confirmed.
- Endpoint compatibility and externally configured model identifiers.
- Reasoning-preserving continuation requirements for longer agent loops.
- Linux/macOS platform verification and final target-model/native demo recording; Windows native interaction now passes.

## Evidence log

### Complete judging rubric supplied - 2026-10-28

- Read attached rubric image: Impact 30%, Use of Meta AI Tooling 25%, Technical Depth & Execution 20%, Demo 25%. Replaced missing-table note in DEMO_PLAN.md with accurate weights and a concrete evidence mapping; no feature/scope expansion or plan snapshot needed.
- Largest competitive risk is making the demo look like a color shortcut plus synchronization rather than a useful agent-authored working environment. Show the connected designer workflow and real Muse reasoning/authoring. Exact track/problem statements and competitor quality remain unknown; no invented scores or win odds.
- README opening already updated with brief idea/demo scope. Reviewed again; no further README changes needed for judging detail, which belongs in demo docs. Documentation acceptance passed; M1-M4 remain incomplete and Slice 003 implementation has not started. No runtime changes or fresh tests/model calls required.

### README opening and supplied judging excerpt - 2026-10-28

- README now starts with brief ambition and demo scope, explicitly distinguishing planned scratchpad/review-board features from the working legacy prototype. No setup commands or runtime behavior changed.
- Read supplied judging stages; recorded Stage One eligibility evidence and Stage Three top-five-per-track video importance in DEMO_PLAN.md. Actual Stage Two criteria/weights were omitted as a table placeholder, so no numerical assessment or invented rubric mapping is claimed.
- Acceptance passed for this documentation task: concise opening and judging evidence/uncertainty recorded. M1-M4 implementation remains incomplete; Slice 003 not started. README reviewed/updated; no runtime tests needed for prose-only change. Latest 21-test/TypeScript baseline remains the preceding planning verification, not a fresh test run here.

### Approved demo and bounded slice planning - 2026-10-28

- User accepts scenario and review with explicit hackathon cuts. Hosted HTTPS and base-app upgrades deferred; Muse Observer is central; another-machine runnable delivery required.
- FOUNDATION_PLAN.md, DEMO_PLAN.md, SLICES.md and 003-006 define minimum foundation, <=180-second story, milestones and numbered work units. Prior broad 003 archived unchanged.
- Library reuse must fit behind small adapters without dictating Mallea contracts. Fabric.js is timeboxed candidate, not installed dependency; native color input/existing stack preferred.
- Fresh Windows planning baseline: 21 tests with loopback access and TypeScript checking pass. Inspected SDK/runtime/registry/desktop scripts. No runtime/dependency changes or inference calls; native/build and other-platform evidence remain historical/untested.
- Plan v012: 15 localized changes, unchanged v011 and reverse reconstruction verified. Updated foundation/architecture/progress pointers and standing scope rules.
- Planning acceptance passed: approved foundation/demo, runnable-delivery gates, slices and first-slice units recorded. M1-M4 implementation incomplete; no active build work unit.
- README reviewed/updated to distinguish planned new apps from working legacy flow; reproduction commands unchanged. Shared portability/credential and diff checks required before final handoff.

### Expanded foundation review - 2026-10-28

- Read the user's full expanded direction and linked Gemini brief through the browser; checked Chrome's official Local Network Access guidance. FOUNDATION_REVIEW.md records requirements, recommendations, implementation gaps, and the requested foundation -> demo -> slices -> build sequence.
- This is a pre-implementation review, not completion or expansion of Slice 003. Plan v011 remains active; the next foundation snapshot and demo-app selection remain pending. Existing notebook/board apps are not assumed to be the final demo choice.
- Fresh Windows baseline: 21 tests passed with loopback access and TypeScript checking passed. Initial restricted test run had three EACCES loopback failures; the permitted rerun passed. No model calls, dependency changes, or runtime modifications.
- Milestone advanced: foundation decision review. Review acceptance passed: linked brief read, current code compared with the expanded goal, and technical issues recorded with reasons. Implementation acceptance for hosted-site pairing, resource identities/version ledger, local customization lifecycle, generic live model, created agents, and Observer remains incomplete.
- README reviewed; no run/setup changes needed for this review-only step. Existing commands remain the reproduction path. No new platform or feature support is claimed. Shared review uses portable paths and no credentials.

Record completed milestone, commands or manual checks, result, provider/model if applicable, token usage or cost when returned, and remaining limitations. Never include keys, private prompts, or raw sensitive traces.

### Development connectivity check - 2026-10-27

- Node v24.19.0; Git 2.55.0.windows.5; no package installation required.
- Loaded existing development configuration without modifying .env or printing its values; model selection supplied by ignored local configuration.
- Initial restricted-network attempt failed before an HTTP response. An explicitly permitted request reached the endpoint but failed the marker check at its 128-token completion limit.
- Raised the per-request cap to 512; the next request returned the exact expected marker, finish reason stop, in 1,393 ms.
- Successful request usage: 155 prompt tokens, 168 completion tokens, 323 total. Reported cost: 0.00090775. Both completed requests together reported cost 0.00164550. These are response usage values, not a billing reconciliation.
- Production credentials were not used. No automatic retries or fallback occurred.
- This validates text generation only. Tool-call round trips, structured generation, and direct Meta compatibility remain pending.

### Development tool round trip - 2026-10-27

- scripts/smoke-tools.mjs passed with automatic tool selection, strict argument validation, local read-only execution, and verification that the model returned a newly generated receipt from the tool result.
- Two requests, 5,154 ms, 1,416 total tokens; combined reported cost 0.00275420. No retries or production calls.
- Syntax check passed. Commands and failure behavior documented in the README for all three platforms; execution verified on Windows only.
- Node 24.19.0, npm 11.17.0, Rust/Cargo 1.99.1, stable-x86_64-pc-windows-msvc detected. Visual Studio 2022 C++ Build Tools and WebView2 155.0.4283.62 detected. Full Tauri compilation remains unverified.
- This is a development API function-call test, not verification of MCP, generated plugins, or production inference.

### Production compatibility and extension structure - 2026-10-27

- Inspected the user's Python example without printing credential-related lines. It uses the Responses endpoint and muse-spark-1.3.
- Extracted a shared, explicitly configured chat-completions helper. The existing production URL was a complete Responses endpoint; the initial appended path yielded HTTP 404. Added root/full-endpoint normalization without changing .env.
- Two subsequent attempts completed the first call but received HTTP 400 on continuation. Normalizing the assistant message did not resolve it. Diagnostic evidence identified unsupported tool_choice none; changed continuation to auto while retaining a strict two-request limit.
- Final production round trip passed: 4,613 ms, 1,588 tokens. Earlier completed first calls used 729 and 731 tokens. Total observed successful-response token usage for this production investigation: 3,048; no monetary usage returned. Error-request billing is unknown.
- Experimental generation initially hit its 1,024-output-token limit. No usage was retained for that failed attempt; added immediate numeric usage output and used a 2,048 cap for the next explicit request.
- Next generation passed exact manifest validation and JavaScript syntax checking: 949 tokens, reported cost 0.00307325. Artifact stored under ignored .mallea/experiments/. No generated code execution or behavior verification claimed.
- README covers every new command for PowerShell/Bash/Zsh. Only Windows execution verified. No installation required from the user at this stage.

### Isolated behavior and app scaffold - 2026-10-27

- Installed exact npm dependencies and generated package-lock.json. Used a project-local npm cache after the user's global cache returned ENOENT. No global configuration changed.
- Implemented QuickJS/WebAssembly in disposable workers without host bindings/imports. Interpreter memory, stack, and execution limits plus outer worker timeout enforced; projected inputs and validated outputs.
- All eight automated tests passed: six review semantics within one test, absent host globals, rejected imports, interrupted loops, bounded memory growth, invalid outputs/permissions, isolated globals, and local HTTP/origin handling.
- Independently verified the actual generated artifact at .mallea/experiments/1793101657036/package.json against all six behavior cases. The committed example is explicitly hand-authored test data.
- TypeScript check and both Vite frontend builds passed. Browser interaction verified blocked -> clear after acknowledgement -> blocked after new evidence -> warning when no longer critical. Notebook frontend acknowledgement also verified. Screenshots are under ignored .mallea/screenshots/.
- Windows Tauri release build passed after adding original SVG-derived desktop icons. Executable: apps/desktop/src-tauri/target/release/mallea-desktop.exe. Native-window interaction not yet tested; browser testing of notebook frontend does not substitute for it.
- The service listens only on loopback. Native CORS origins are explicitly listed. This is a local unauthenticated scaffold, not the planned authenticated registry or MCP gateway.
- No model calls were needed for this milestone; reused the existing generated artifact. All major reproduction steps are in README.md with Windows and Linux/macOS commands.
- Created plan v002 by one byte-preserving insertion describing the runner. Original v001 hash unchanged; unaffected prefix and suffix verified byte-identical.

### Documentation and proactive observer planning - 2026-10-27

- Moved preview launch and interaction instructions to the top of README; retained all detailed platform/setup guidance under Developer Setup.
- Removed real machine paths from shared docs, including narrow redactions of older snapshots requested by the user. Added a standing repository-relative-path rule.
- Added the observer proposal to v003 with localized edits and unchanged-byte verification. This is planning only; no event collection, background inference, or proactive suggestions have been implemented.

### Windows dependency-lock recovery - 2026-10-27

- User encountered EPERM unlinking the loaded native build binding during npm ci while agent-started previews were still running.
- Stopped only the known web, notebook, and workspace-service sessions. The dependency reinstall then succeeded without administrator mode or manual deletion.
- README now distinguishes initial/recovery installation from ordinary startup and explains the Windows file-lock recovery procedure. Added a standing rule to stop project previews before replacing dependencies.
- Preview servers are intentionally left stopped so the user can start them from the guide.

### Slice 001 completed - 2026-10-27

- W1: SDK 0.2 initial/revised contracts pass validation; unsupported permission, script markup, remote styles, and policy/source mismatch rejected.
- W2: SQLite restart test retains package/acknowledgement. Failed and stale updates cannot replace active package. Installation transaction preserves app state.
- W3: deterministic tests prove repair uses actual diagnostics, stops after three total attempts, and discards late cancelled results. HTTP tests reject missing session tokens and hostile origins.
- W4-W5: browser walkthrough generated the initial panel on attempt 1; its screenshot, observation, status, and acknowledgement rendered in the isolated frame. Preview acknowledgement changed only preview state. Access approval enabled installation; live task remained unreviewed until acknowledged in the installed panel.
- W6: a real follow-up generated version 1.0.1 on attempt 1, changed the heading to Release confidence, and changed ordinary stale tasks to warnings. The critical task's acknowledgement stayed at revision 1. The initial installed version was 1.0.0.
- W7: browser reload and actual service stop/restart retained v1.0.1 and the critical acknowledgement. Ordinary task remained unreviewed and showed warning. A separate generated draft changed heading to Evidence at a glance and background to the requested hex color while retaining the policy; it was validated but not installed.
- Seventeen automated tests pass, including HTTP lifecycle/access and deterministic failed-update recovery. TypeScript and both frontend production builds pass. Tests used synthetic model responses where determinism was needed; the browser/variation runs used real development inference.
- Three development generations: all attempt 1, 12,901 total reported tokens, combined reported cost 0.04259685. No production fallback. Private infrastructure details remain outside shared docs.
- Direct Meta muse-spark-1.3 validation used scripts/verify-authoring.mjs --production with initial and follow-up requests. Both passed on attempt 1, 4,178 + 4,218 = 8,396 tokens; no monetary cost was returned. Initial/revision jobs took approximately 12.6/9.8 seconds. Verified policy, activation, and retained acknowledgement in an isolated in-memory workspace; this was a service authoring check, not a separate Meta browser walkthrough.
- Production validation's original summary printed zero when cost was absent; corrected the reporting script to emit null for unavailable monetary usage. No paid rerun was necessary for this reporting-only correction.
- Browser evidence screenshot: .mallea/screenshots/slice001-installed.png. Test workspace: .mallea/slice001-live.sqlite. Both are ignored local artifacts; the default user workspace remains separate.
- README includes the exact browser walkthrough, fresh database selection, generic configuration, bounded model verification, Windows commands, and parallel Linux/macOS commands. Linux/macOS are untested. Plan v004 records the narrow SDK/SQLite boundary with verified byte preservation.
- Known limits: no arbitrary generated React, no recoverable conversation/job status after service restart (installed packages and drafts persist), no rollback UI, no multi-user authentication, and no cross-app routing or observer. Native generated-frame compatibility is not yet verified.
- Final shared-file scan found no prohibited infrastructure names or machine-specific paths. Agent-started browser/service processes were stopped after verification to avoid Windows dependency locks.

### Post-Slice 001 capability audit - 2026-10-27

- User confirmed the planned flow worked. Re-read current status, source, goal, and detailed plan; baseline 17 tests and type check passed.
- A1-A4 complete: inspected actual SDK boundaries; individually probed layout, computed labels, and an unsupported threshold; made a bounded honesty fix; planned Slice 002.
- Found a valid-but-wrong result: the threshold request returned ready while still blocking after one unseen revision. Recorded it as a request failure, not success.
- Added schema-validated unsupported reason/alternative, terminal handling without a draft, and builder feedback. Repeated threshold probe returned unsupported; repeated supported computation still passed at ten inputs. Model-assisted refusal is not a general semantic guarantee.
- Five development responses, all first attempt: 15,842 reported tokens and reported cost 0.0526615. No direct Meta requests or live database changes. Full portable evidence and local report paths are in CAPABILITY_AUDIT.md.
- Nineteen automated tests and both frontend builds pass. New tests preserve installed data through refusal and reject malformed/mixed responses. The new refusal UI compiled; browser user verification and direct Meta validation of the new response form remain pending.
- Added individually selected reproduction probes and README instructions for Windows/Linux/macOS; only Windows executed. A request-specific report check catches the observed kind of mismatch independently of package validation.
- Plan v005 adds one exact-preservation insertion; v004 is unchanged. Slice 002 is documented but not started: native verification, app contracts/ownership, registry/grants, MCP, capability-aware authoring, events, and end-to-end acceptance.
- Threshold rules remain unsupported and are a gated follow-on candidate; no observer, learning feature, or other broader capability was added.

### Slice 002 completed - 2026-10-27

- W1: initial native panel showed static markup but blank bindings under inherited srcdoc policy. Replaced frame delivery with short-lived loopback URLs and independent restrictive content policy. Actual native screenshot/text/action check passed with an existing generated package: revision 1 / reviewed 0 / blocked became reviewed 1 / clear. Native release rebuild passed after closing the previously running executable; a build attempted while it was open hit a Windows file lock and was retried after closure.
- W2: introduced app definitions, notebook-owned observations, board-owned linked tasks, and separate installed package pointers. Transactional migration test proves consistent backup, retained board package/acknowledgement, separate empty notebook activation, and persistent edits. No live migration of the user's default database was performed.
- W3-W4: registry, scoped sessions/grants, one-use connection tickets, outbound owner requests, and official SDK gateway implemented. Pinned @modelcontextprotocol/sdk 1.32.2, ws 8.22.0, zod 4.6.7 after official documentation/registry checks. Real SDK Streamable HTTP test proves discovery, denied ungranted reads, authorized owner reads, successful third-instance routing, wrong-instance/cross-workspace denial, offline failure, and reconnect refresh.
- W5: two real development generations used app definitions and the actual discovered MCP capability catalogue. Both passed attempt 1. Preview acknowledgement stayed separate. Installed board v1.0.0 then revised v1.0.1; notebook remained without an installed package.
- W6: acknowledged revision 1 on the board, changed text in the actual native notebook, and saved. Browser updated text/revision to 2 without reload, kept acknowledgement 1, and blocked again. Acknowledged 2, then installed critical-only revision with Release confidence heading. Critical acknowledgement stayed 2; ordinary unreviewed task warned. Duplicate edit/operation conflict/stale revision/acknowledgement checks pass. Host calculates workspace review independently of frame mounting.
- W7: closing notebook produced owner-offline feedback; reopening restored evidence. Service restart preserved v1.0.1, grants, evidence revision 2, acknowledgement 2, and ordinary warning; both hosts reconnected automatically. Actual browser refresh behavior and frame bridge work through the Vite proxy and native service URL.
- Final focused suite: 21 tests pass. TypeScript and both frontend builds pass. Windows release executable built successfully; final frontend bundle hashes are unchanged by subsequent type-only edits. Linux/macOS remain untested.
- Development usage: initial 3,806 tokens / reported cost 0.0102291, revision 5,380 / 0.015563; total 9,186 tokens / 0.0257921. No repairs, automatic fallback, or extra generation calls.
- Direct Meta muse-spark-1.3 service-level milestone check: initial 4,371 tokens in 9,107 ms, revision 4,181 tokens in 6,170 ms; both attempt 1. Total 8,552 tokens; monetary usage not returned. It verified real MCP/session/owner routing, changed evidence, re-review, app scope, follow-up, and retained acknowledgement using a simulated outbound notebook client. This check was separate from the actual native UI walkthrough and must not be described as a Meta-native recording.
- README documents the experience-first three-process walkthrough, dependencies, backed-up migration/recovery, Windows/Linux/macOS commands, SDK/connection boundary, and bounded verify-collaboration command. ARCHITECTURE.md and REHEARSAL_002.md record implementation and measured evidence. Plan v006 contains one byte-preserving insertion; v005 is unchanged.
- Remaining work includes final 180-second script/timing/recording with target Meta and actual native window, full created-agent lifecycle, optional observer/learning gates, and broader generation. No threshold rule or arbitrary app-generation capability was added.
- Cleanup: agent-started service/browser/native test processes stopped after verification. Shared-file scan found no prohibited infrastructure names or real machine paths; v005/v006 hashes match the exact-preservation log. User default database and credentials were left untouched.

### Deadline confirmed by user - 2026-10-27

- User reports roughly nine days remaining and a November 4 morning Eastern Time submission target. No exact cutoff hour supplied.
- Plan v007 updates only the scheduling preface; final two full days are reserved for feature freeze, clean setup, target-Meta/native rehearsal, recording, editing, and submission checks.
- No runtime changes or inference calls. Slice 002 acceptance remains pending; no subsequent slice has started.

### User acceptance and goal/generality review - 2026-10-27

- User confirms the native-edit/board-acknowledgement flow works after understanding the already-reviewed button state. Updated the current acceptance record without attributing all automated checks to the user.
- Re-read current implementation and active goal/plan. Fresh 21 tests and TypeScript checking pass; no model calls or runtime code changes.
- PROGRESS_REVIEW.md separates reusable runtime mechanisms from fixed review SDK, gateway, app-type, and storage assumptions. App descriptors alone cannot introduce an unrelated domain today.
- Proposed Slice 003 closes existing lifecycle requirements: inspectable persistent capability records, pause/resume, compatible version restore, and bounded honest activity history. It is not started. The proactive observer remains the next separate candidate; final two days remain reserved for demo/submission work.

### User direction: bidirectional value and a testable MVP - 2026-10-27

- User requires communication to produce visible effects in both directions, a compelling demonstration of the idea's ambition/value, and reliable workflows people can test. A few explicit use cases are acceptable.
- Reprioritized proposed Slice 003 from broad lifecycle management to a closed retest loop: web request -> native actionable item -> native result/new evidence -> board update. Retest form/action and guided try mode remain planned, not implemented.
- Scoped the proposed MVP to evidence review, follow-up requests, and returned results. Require materially different authored review/action capabilities, not cosmetic prompt variants.
- Added demo/tester feature-admission guidance to AGENTS.md. Plan v008 records six localized changes with unchanged-byte verification; v007 remains unchanged. The earlier lifecycle-first slice proposal is archived byte-for-byte.
- Scope remains a known domain with declared capabilities. The observer/lifecycle work should support the two priorities; final two days remain reserved for recording/submission.
- No runtime changes, model calls, or new implementation slice started during this planning update.

### Philosophy correction: malleability and communication are one foundation - 2026-10-27

- User rejected the communication-first/retest-product direction. The acceptable MVP bound is a small set of UI elements/layouts/operations, not a few predetermined high-level workflows.
- FOUNDATION.md now records the core design hypothesis: live app models, point-of-use agent/human composition, native agent participation, and bidirectional capabilities reinforcing each other, with a longer-term first-principles OS direction. No claim of established novelty or present OS implementation.
- Plan v009 makes ten localized corrections with reverse-reconstruction/byte-preservation verification. v008 remains historical and unchanged.
- Replaced the proposed Slice 003 with the live-model/shared-renderer/schema-driven-capabilities bridge. Archived its communication-first predecessor byte-for-byte. No implementation started; current runtime still has the review-specific limits recorded above.
- Updated standing guidance and progress-review recommendations to prevent the same scope drift. No runtime changes, tests, or inference calls were needed for this planning correction.

### Observer, builder, created agents, and README gate clarified

- User specifies the Observer as the ONLY predefined agent type supplied by the framework. It observes permitted per-app usage patterns and suggests useful changes. Default availability and observation activity controls are distinct; the Observer remains unimplemented.
- The agent builder is a permanent framework capability, not a second preinstalled resident agent. It creates user agents and reshapes app interface/layout/appearance/behavior. A minimal execution model may use an explicit trigger and bounded model call over approved inputs with typed output bound to a view; metadata alone is insufficient.
- Classic-app connector adapters are a future resource/action extension point. No legacy-app integration, spreadsheet, or word processor is implemented or newly in scope. The examples illustrate the architecture.
- Plan v010 contains ten localized changes and verified unchanged-byte preservation from v009. FOUNDATION.md and proposed Slice 003 carry the clarified roles. Slice 003 is still not started.
- README reviewed and updated: current bounded package authoring is distinguished from the planned default Observer, live model/user-agent foundation, and future connectors. Added a mandatory end-of-slice README review/update rule to AGENTS.md, the plan, and slice handoff. If no edit is needed, future slices must record that review explicitly.
- Documentation-only clarification: no runtime changes, inference calls, or new execution claims. Existing test/build evidence remains the last recorded baseline.

### Cross-app visual scope boundary - 2026-10-28

- User explicitly keeps data/state exchange through the existing protocol approach and excludes communication of visual elements for now.
- Plan v011 adds one byte-preserving section-9 insertion: data/state/events and permitted action requests/results may cross app boundaries; visual components, rendered UI, and view trees do not. Each app renders its own UI and edits its local model. Shared framework code and evidence images as data remain distinct.
- Updated foundation, proposed Slice 003, standing guidance, and README to carry this boundary. No runtime changes or tests/inference calls required for this documentation-only clarification.
