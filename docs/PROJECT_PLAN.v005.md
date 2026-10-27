# Mallea: software that takes your shape

## 1. Purpose and success criteria

Build a lightweight foundation for applications that users can change at the point of use. Every application built on Mallea includes access to an agent builder. A user describes a capability; a Meta-powered agent creates or revises an installable extension containing interface and behavior, using the app's available data and permitted actions.

The hackathon submission must make this concrete in a three-minute video. Show two distinct applications, one Windows desktop application and one browser application, built on the same foundation. Show real model-authored software changes and useful collaboration across the applications.

Primary goals, in priority order:

1. Deliver a polished, understandable demonstration with a visible before/after transformation.
2. Make Meta models central to authoring and revising executable capabilities.
3. Demonstrate a reusable foundation through shared contracts, extension lifecycle, and an agent builder present in both hosts.
4. Show scoped information exchange between desktop and web applications.
5. Produce a credible, inspectable engineering portfolio with reproducible setup and honest limitations.

Success means a fresh workspace can run the demo, generate and install a working extension, revise it without losing app data, react to a cross-app change, and retain the installed capability after reload. Passing a scripted happy path alone does not establish general-purpose app generation.

## 2. Product boundary

Mallea is an application framework and runtime, not an operating system or a general coding harness. Its distinguishing experience is modifying running software in its own context: the agent can understand the app's registered capabilities, build a new interface, and install useful behavior into that app.

The user-facing authoring surface should be available in every Mallea app. App developers register their app's data contracts, actions, events, and extension slots. They do not implement a separate bespoke agent builder for each app.

An app's built-in builder and its user-created agents are separate concepts. The builder authors capabilities. Created agents have a persistent identity, purpose, permitted tools, trigger configuration, and execution history. Deterministic reactions should run as ordinary code; invoke a model when interpretation or reasoning is actually needed.

Hackathon scope is deliberately bounded. The framework supports a documented extension SDK and selected insertion points, rather than arbitrary rewriting of the trusted host.

## 3. Demonstration scenario

Working scenario: a desktop playtest notebook and a browser production board for a small game team. This uses the creator's game-development background without requiring a game engine.

The notebook owns screenshots, observations, and their revisions. The board owns tasks, release criticality, review state, and links to notebook evidence. Seed a small synthetic project with visually clear screenshots and linked tasks.

Main request in the browser board:

> Create an evidence-review agent for this board. Give it a panel showing the original playtest screenshot and observation, highlight changes since the last review, and let me acknowledge what I have checked.

The builder discovers permitted notebook capabilities, generates a package, validates it, shows a preview and requested access, and installs it. The panel must be useful and visually integrated with the board.

Follow-up request:

> Only block release-critical tasks when their evidence changes. Show a warning for the other tasks.

The builder revises the installed capability while preserving existing task and review data. A human changes an observation in the desktop notebook. The browser board receives the new revision and updates the panel and task treatment. Acknowledging the evidence clears the review requirement for that revision. Reload demonstrates persistence.

This workflow must include genuine model-authored interface and behavior. Seeded domain data and SDK components are allowed; substituting a prewritten final plugin for a generation result is not a successful authoring demonstration.

The scenario is the initial implementation baseline, subject to early feasibility results. Changes require a new plan snapshot.

## 4. Three-minute video outline

| Time | What viewers see | What it proves |
| --- | --- | --- |
| 0:00-0:20 | Desktop notebook and browser board; missing evidence-review workflow | A concrete user problem |
| 0:20-1:10 | Natural-language request, concise build activity, preview, installation | Meta creates a capability inside the application |
| 1:10-1:50 | Follow-up request and visible behavior change | Iterative software modification with retained state |
| 1:50-2:35 | Desktop observation changes; browser reacts; user acknowledges | Useful cross-app collaboration |
| 2:35-3:00 | Reload, installed agent/package view, concise architecture and model credit | Persistence and a reusable foundation |

Adjust timings after measured rehearsals. Label time compression or edited waiting periods. Display actual provider/model identity. Do not imply prerecorded generation is live. Retain a reproducible fallback recording of a real run if live connectivity fails.

## 5. Architecture baseline

Use TypeScript and React for the shared application runtime and UI. Use a browser host and a Tauri Windows desktop host. Compile the native desktop shell during development; generated extensions are separate JavaScript bundles, so ordinary extension changes do not require rebuilding Rust or redistributing the desktop executable.

Use a small trusted Node service for model access, package builds, persistence, workspace membership, and routing. Start with one service and one private demo workspace. Use SQLite or an equivalently simple local store for the service; settle the exact library during scaffolding. Do not build distributed infrastructure for the hackathon.

Proposed repository organization:

```text
apps/web/                  Browser production board
apps/desktop/              Tauri playtest notebook
packages/runtime/          Shared app shell, builder entry point, plugin lifecycle
packages/sdk/              Types, schemas, UI slots, actions, resources, events
packages/agent/            Provider adapters and bounded authoring loop
services/workspace/        Trusted registry, routing, persistence, builds, MCP
examples/                  Synthetic data and illustrative extension packages
tests/                     Contract, lifecycle, and end-to-end checks
docs/                      Versioned plan, setup, evidence, architecture, demo
```

Treat this layout as a starting structure; do not create empty packages without a concrete implementation need. Keep host-specific code behind adapters. Share capabilities and lifecycle code, not merely colors and typography.

### Slice 001 implementation boundary

The first authoring slice uses SDK 0.2 packages with a model-authored declarative UI tree and a pure JavaScript review function. The trusted compiler emits escaped markup from allowlisted elements, bindings, styles, and actions; it does not compile arbitrary generated React or install dependencies. The UI runs in an opaque-origin sandboxed iframe, and behavior runs in the existing isolated worker. Initial behavior is bounded to blocking all unreviewed tasks or blocking critical tasks while warning for ordinary tasks. This proves the lifecycle without claiming arbitrary app generation.

Use Node 24 built-in SQLite for immutable package versions, drafts, active version, and host-owned review state. Preview uses a separate in-memory data copy. A loopback service with origin checks and a per-process browser session token supports the local slice; production workspace authentication, app registration, rollback controls, and full created-agent records remain later milestones.

### Capability audit and the next slice

After Slice 001, distinguish package validity from fulfillment of a user request. An audit showed that layout composition and computed labels work, while an unsupported threshold rule could silently become an existing supported policy. The authoring response now permits a validated unsupported result containing a reason and an alternative; it ends without a draft or activation. This is a model-assisted feasibility response, not a deterministic proof that all unsupported requests will be detected. Preserve request-specific checks and explicit preview review.

Slice 002 will prioritize distinct notebook/board ownership, app-provided capability descriptions, actual Windows native compatibility, and authorized cross-app evidence exchange through the planned MCP gateway and event connection. The shared builder should consume app definitions rather than a hardcoded production-board context. Keep domain validators with the app contract; the framework enforces generic isolation, shape, and access constraints. Verify routing with a third test instance without adding a third polished demo app.

A configurable revision-gap threshold is a bounded follow-on candidate after the cross-app slice passes, not committed Slice 002 scope. It requires an explicit policy parameter, user-visible behavior examples, and an independent host-owned behavior oracle at boundary values. Do not enable it by weakening the existing validator or silently treating a different policy as success. Wider inputs, forms, actions, or multiple panels require their own registered app capabilities and acceptance checks.

## 6. Extension contract and lifecycle

An extension package includes an identifier, version, entry points, supported SDK version, declared permissions, UI contributions, actions or handlers, and state schema version. A created agent may reference this package and its registered tools and triggers.

Expose a small, typed host SDK with JSON-schema-validated inputs and outputs. Support reading allowed resources, calling allowed actions, receiving approved events, and maintaining namespaced extension state. The host owns credentials, authoritative data access, and permission enforcement.

Lifecycle:

1. Capture the user's request and the minimum relevant app context.
2. Discover available capabilities and select the permitted subset.
3. Generate a structured proposal and extension files.
4. Validate manifest/schema, type-check, build, and run focused behavior checks.
5. Feed actual diagnostics into a bounded repair loop if validation fails.
6. Show a working preview and understandable requested access.
7. Install an immutable package version and activate its registrations.
8. Revise by producing a new package version; preserve compatible state.
9. Allow disabling or restoring a previous package version.

Only activate a new version after validation succeeds. A failed revision leaves the installed version usable. Code rollback does not reverse external actions or automatically downgrade migrated data; the demo should avoid irreversible migrations.

Use a fixed dependency allowlist. Do not run generated package scripts or allow arbitrary package installation. Compilation must not execute generated application code with the build service's privileges.

## 7. Execution boundary

Generated UI should run in an isolated iframe with a narrow message bridge and restrictive browser policy. Validate message source, request shape, and granted capability on the host side. Do not expose raw Tauri commands to generated code. React component loading alone is not an isolation mechanism.

The initial behavior runner uses QuickJS compiled to WebAssembly in a disposable worker. Each invocation receives only projected JSON inputs, has an 8 MiB interpreter heap limit, a 100 ms interpreter execution deadline, and a two-second worker deadline. Imports and host bindings are unavailable. Validate outputs before returning them to the app. This is an experimental execution boundary, not a claim of complete protection against interpreter vulnerabilities. Generated UI isolation remains separate work.

Long-lived registrations belong to the host, not to a mounted panel. A generated bounded handler can execute in a restricted worker or equivalent isolated runner. Validate the practical isolation design in the early spike; do not silently run arbitrary generated code inside the trusted Node process.

For the hackathon, event processing is guaranteed only while the required hosts/service are running and connected. Closing a panel must not disable its installed behavior; closing an application need not preserve background execution. Full offline operation and autonomous background services are out of scope.

## 8. Built-in agent builder experience

Every app exposes the same discoverable authoring entry point. The builder receives app identity, current selection, available UI slots, relevant schemas, and permitted capabilities. It should explain the proposed change in user language and show the result before activation.

Use a compact conversation alongside a live preview. Show meaningful stages such as understanding, building, checking, and ready. Show diagnostic summaries when useful; do not expose raw implementation details by default or fabricate hidden reasoning.

Created-agent records should contain purpose, permissions, trigger, associated extension, enabled state, and recent runs. Users can inspect, revise, disable, and remove their own created agents. Persist these records independently of the conversation transcript.

Design the agent builder independently around the user's task, the extension lifecycle, and the current app context. Do not inspect or copy unrelated private application code. Mallea's distinct emphasis is creating app-native interfaces and cross-app capabilities from the current usage context.

### Proactive built-in observer (planned)

Include an optional framework-provided observer agent in every app. Its purpose is to notice repeated in-app work and suggest a concrete improvement that the existing builder can create. Implement it after the builder can preview and install a real capability; do not add a separate authoring system.

For the first version, observation is off until the user enables Suggest improvements for the workspace. Observe only allowlisted semantic events emitted by Mallea apps, such as task selection, linked-evidence opening, and review acknowledgement. Do not capture raw keystrokes, screen recordings, unrelated applications, or note contents. Use app/entity IDs and event types; remove identity details before inference where not required. Disable observation and clear the session buffer when the setting is turned off. No weight training or reinforcement learning is involved.

Keep a session-local buffer of at most 50 events with a 30-minute expiry. A cheap deterministic gate identifies an opportunity, initially repeated evidence lookup for at least three distinct tasks. After a brief idle period, one bounded model request receives a minimal event summary plus the app's permitted capabilities. The model may return no suggestion; it must not invent capabilities or treat event content as instructions. Do not call the model for every click. Allow at most one visible suggestion, suppress duplicates, and use a ten-minute cooldown after a suggestion or dismissal. Clear pending requests when observation is disabled and discard their late results.

Show a quiet in-app suggestion with an evidence-backed explanation, for example: You opened linked evidence for three tasks. Would an evidence panel here save those trips? Offer Preview change, Not now, and Do not suggest this again. An accepted suggestion becomes an editable builder request with its evidence and permitted scope. Acceptance opens the normal preview/install flow; it does not authorize automatic installation or broaden permissions. A dismissed suggestion must not repeatedly interrupt the same workflow.

Demo integration: begin with a few real evidence lookups, show the observer's suggestion, then accept it into the existing evidence-review build. Preserve the follow-up revision and cross-app effect. Demonstrate the actual enabling setting and interaction trace; do not substitute a timer or canned suggestion for the observer. Fit this into the opening problem/generation segment of the three-minute story rather than adding an unrelated scene.

Acceptance: enabled observation produces only approved event fields; disabled observation makes no inference requests; repeated interactions produce at most one eligible suggestion; a normal one-off action produces none; unsupported proposals are rejected; dismissals and cooldowns work; accepted suggestions retain the builder's normal validation and permission boundaries. Cover these with local tests before a bounded live model check. Treat success as one useful suggestion in a demonstrated workflow, not a claim of general understanding of user intent.

## 9. MCP and cross-app communication

Adopt MCP through an existing SDK for tool/resource exposure and agent-to-capability calls where practical. Do not invent a competing tool schema and wire protocol without evidence that MCP blocks the demo. Pin a supported SDK/protocol combination and verify its actual capabilities before depending on optional features.

MCP does not by itself provide private workspace membership, app-instance discovery, routing to an offline desktop, authorization policy, or domain synchronization. Maintain a small workspace registry with app instance ID, app type, owner/workspace, capability versions, and connection availability.

Start with a service-hosted MCP gateway exposing authorized app capabilities. Browser and desktop hosts establish outbound authenticated connections to the workspace service. The browser does not accept inbound server connections. Route host-owned actions over the existing connection; do not expose a public HTTP server from each desktop.

Use an ordinary event channel, such as WebSocket, for app presence and domain changes. Reuse MCP resource notifications where supported and useful, but do not mistake them for a durable application event log. This split preserves standard agent tool calls while keeping live UI updates simple.

Initial domain contracts include reading an observation, retrieving its approved evidence, receiving an observation revision, and updating board review state. Use stable entity IDs, revision numbers, operation IDs for retry deduplication, and explicit ownership. Avoid generic two-way database synchronization.

Discovery does not grant permission. Each execution checks workspace identity and allowed capabilities. Share only requested data. The trusted relay may see routed content; do not claim end-to-end encryption.

No routing logic may hardcode the two demo app IDs. Validate registration and invocation with a third test instance. This supports the extensibility claim without expanding the main video to a third application.

## 10. Providers, models, and spending policy

Use an externally configured development inference endpoint and model identifier for initial testing. Keep endpoint URLs, credentials, and environment-specific model choices outside source code and shared documentation. Use the existing local .env configuration; inspect names only as needed and never print values.

Reserve direct Meta API calls for validation of each completed milestone and targeted debugging of failures on that provider. Development endpoint success does not establish production compatibility. Do not silently fall back to production when development requests fail.

Build one application-facing provider adapter interface for messages, tools, results, usage, cancellation, and errors. Keep provider-specific request and response handling behind it. Verify tool-call continuation and structured output separately for each provider. Do not assume that advertised native MCP support means both providers expose identical remote-MCP APIs.

Direct Meta candidate: Muse Spark 1.3 for the principal demo agent. Muse Wonder is an optional comparison for difficult generation or repair if justified by observed results and available budget. Confirm actual API IDs and access using the working example and official documentation before implementation. Do not assume display names are request identifiers.

Contributor tiers are optional, not the default. The user-provided catalogue says their inputs and outputs are used for training. Restrict any use to project-owned code and synthetic data. Do not send unrelated private material to inference providers.

Use bounded requests: explicit output limits, per-run tool-step limits, cancellation, and at most two repair attempts after an initial generation in the early spike. Avoid unattended retry loops. Tune limits only from evidence and record material policy changes in a new plan version.

Record provider, model, run duration, token usage, and cost when supplied. If calculating cost, identify the price source and mark it as an estimate. Do not invent a budget amount; the user's numerical direct Meta allowance is not yet known. Before automated batches, establish an explicit spend ceiling. Ordinary bounded milestone tests are authorized by the user's instruction.

Keep secrets in the trusted service. Never bundle keys into web assets, plugin packages, screenshots, demo videos, test snapshots, or logs. Use synthetic fixtures for tests and redact traces before sharing.

## 11. Ten-day execution sequence

This is a relative sequence, not a confirmed calendar deadline. Check the remaining hackathon time before starting implementation and compress scope if needed.

| Day | Work | Deliverable and exit gate |
| --- | --- | --- |
| 1 | Inspect Python example, environment, and toolchains; implement generic inference spike | Bounded development generation and tool call; one direct Meta compatibility check; findings recorded |
| 2 | Define extension SDK and build/validate/preview loop; test generated UI and behavior | A small extension generated from a request, installed, and revised; credible isolation boundary |
| 3 | Scaffold shared runtime, service persistence, app registration, and both hosts | Browser and Tauri shell running shared runtime; distinct app identities; builder entry point in both |
| 4 | Build notebook and board with synthetic fixtures and ownership contracts | Screenshots/observations, tasks, links, revisions, and basic readable layouts |
| 5 | Implement MCP gateway, outbound routing, scoped capabilities, and event delivery | Board reads approved notebook evidence; third-instance routing test; permission failures handled |
| 6 | Complete natural-language builder, bounded repairs, package installation, and agent records | Main request creates working evidence-review capability on the development endpoint and passes direct Meta milestone check |
| 7 | Implement revision, preserved state, host-owned triggers, and reload behavior | Follow-up request works; desktop changes affect board; acknowledgements and persistence verified |
| 8 | Add the bounded observer suggestion flow after the builder works; polish visuals, error states, and regression checks | Real interaction-based suggestion accepted into builder; complete scenario rehearsed with target direct Meta configuration; timings captured |
| 9 | Feature freeze, clean setup rehearsal, recording preparation, documentation | Reproducible runbook, stable demo dataset, three-minute script, backup real-run footage |
| 10 | Final bounded smoke check, record/edit, verify submission materials | Three-minute video, runnable repository, architecture explanation, limitations and model attribution |

Each substantial completed milestone gets a focused direct Meta check. Reuse local deterministic tests and the development endpoint during iteration; do not repeatedly consume direct Meta budget for unrelated changes.

## 12. Validation and acceptance gates

Provider gate: both configured adapters can complete a minimal request and a genuine tool-call round trip. Streaming is desirable but not a prerequisite for correctness. Unsupported options produce actionable errors.

Generation gate: a model can build an extension from the SDK documentation, receive actual validation errors, and produce a usable result within the bounded loop. Try a small variation on the demo request to detect dependence on a single memorized prompt.

Lifecycle gate: install, revise, disable, reload, and restore a compatible earlier package. Verify retained state and rejection of invalid packages. A failed revision must not replace a working package.

Communication gate: verify authorized cross-app reads/calls, rejection of unauthorized capabilities, duplicate-event handling, stale revisions, disconnection feedback, and generic routing across three registered instances. Reconnecting clients should refresh authoritative state rather than assume no events were missed.

Behavior gate: changing evidence marks the correct task; release-critical and ordinary tasks differ as requested; acknowledging revision N does not acknowledge a later revision N+1. Closing the panel must not stop active-host event handling.

Demo gate: both actual runtimes participate, the target direct Meta model authors the capability, no credentials appear, and the full story fits three minutes with any time compression identified.

Run focused unit/contract tests for permissions, schemas, revisions, and lifecycle transitions. Use one end-to-end scenario plus manual visual checks in browser and desktop. Avoid large test suites that only mirror trivial implementation details.

## 13. Required deliverables

- Shared framework runtime and documented app registration/extension SDK.
- Working browser production board and Windows desktop notebook.
- Built-in agent builder reachable in both apps, with persisted created-agent records.
- Optional built-in observer that turns an evidence-backed suggestion into an editable builder request, with observation controls, dismissal, and cooldown.
- Generic configurable inference interface with validated development and direct Meta configurations.
- Generated extension build, validation, preview, install, revision, and disable/restore lifecycle.
- Workspace registry, MCP capability gateway, and working cross-app evidence flow.
- Synthetic demo data, screenshots, and a repeatable reset/setup workflow.
- Focused verification evidence and honest limitations.
- README setup instructions, architecture and SDK notes, provider configuration example with placeholders only, and demo runbook.
- Three-minute demo video and submission text explaining Meta's substantive role.

The initial documentation and .gitignore are planning deliverables, not evidence that any runtime capability already exists.

## 14. Scope cuts and non-goals

Defer a custom kernel, Linux distribution, RL training from OS interactions, local model deployment, token lending, P2P discovery, federation, arbitrary native plugins, a plugin marketplace, production multi-tenancy, and unrestricted application rewriting.

Do not add voice, image generation, multiple collaborating authoring agents, or a third polished application unless the full main scenario is already stable. More models and more agents are not success criteria.

If time is short, cut editor configuration options, agent scheduling variants, decorative dashboards, and optional model comparisons first. Preserve real generation, one meaningful follow-up revision, both runtimes, persistence, and the cross-app effect.

If MCP integration stalls, first reduce optional MCP features and keep the SDK's basic tools/resources path. Replacing MCP or changing the runtime boundary requires an explicit documented plan revision, not an invisible shortcut.

## 15. Risks and responses

| Risk | Response |
| --- | --- |
| Model cannot reliably author the proposed SDK | Test early, reduce SDK surface, improve diagnostics, bound repairs |
| Provider differences appear late | Direct Meta checks at milestone boundaries, explicit adapters |
| Generated code obtains excessive access | Isolated execution, narrow validated bridge, host-enforced grants |
| Desktop build consumes the schedule | Validate Tauri toolchain early, keep native surface minimal |
| Cross-app state becomes inconsistent | Single owner per entity, revisions, deduplication, refresh on reconnect |
| Attractive UI hides weak model contribution | Show authored artifact, follow-up revision, and real resulting behavior |
| Video spends too long waiting | Measure latency early; clearly label compressed waits |
| Demo looks like a canned template | Use a behavioral follow-up and small alternate request during validation |
| Budget exhausted during iteration | Separate development configuration, bounded calls, direct Meta milestone gates |
| Overclaiming framework generality | Demonstrate shared implementation and generic registration; state limits |

## 16. Pending investigations and decision discipline

Before substantial implementation, inspect the working Python sample at `../experiments`. It was located but not yet reviewed in sufficient detail. Preserve its contents and keep secrets out of outputs. Build the agent editor independently within this repository.

Confirm hackathon rules, deadline, allowed model access paths, and submission requirements when available. Validate the submitted demonstration against those requirements; retain direct Meta-powered demo validation.

Record new evidence in STATUS.md. If evidence changes a plan decision, create a new immutable snapshot with only the affected passages changed. All other bytes must remain identical. Follow docs/README.md; never silently edit this baseline.

## 17. References and evidence status

- Configured inference endpoints: tool-calling and structured-output behavior require actual API testing; configuration details remain local.
- Meta model catalogue: supplied by the user from the logged-in developer page. Spark 1.3, Contributor, and Wonder descriptions are catalogue claims, not locally benchmarked results.
- MCP SDK documentation: https://ts.sdk.modelcontextprotocol.io/server . Use a supported pinned implementation; verify version-specific behavior during integration.
- Tauri architecture: https://v2.tauri.app/concept/architecture/ . Shared web UI plus native host; generated plugin execution requires its own boundary.
- AgentRx: https://www.microsoft.com/en-us/research/blog/systematic-debugging-for-ai-agents-introducing-the-agentrx-framework/ . Inspiration for evidence-backed diagnostics; a full research-framework implementation is outside scope.
- Malleable software: https://www.inkandswitch.com/essay/malleable-software/ . Conceptual context, not a claim of novelty for every individual feature.

Research suggestions whose contents could not be verified must not be treated as implemented requirements or supporting evidence.
