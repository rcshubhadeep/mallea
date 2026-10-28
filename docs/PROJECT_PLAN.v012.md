# Mallea: software that takes your shape

## 1. Purpose and success criteria

Build a lightweight application framework whose running applications can be inspected and reshaped by humans and agents at the point of use. Interface, data bindings, permitted local/remote actions, behavior, and agent definitions form a persistent live application model. Every Mallea app includes an agent-builder capability. The Observer is the only predefined agent supplied by the framework: it observes permitted app-usage patterns and suggests useful changes. Users can also invoke the builder directly to create their own agents and reshape interface, bindings, behavior, layout, or appearance. Builder operations may invoke Meta models, but the builder is not a second preinstalled resident agent. Installable extensions remain one delivery mechanism within that foundation.

The hackathon submission must make this concrete in a three-minute video. Show two distinct applications, one Windows desktop application and one browser application, built on the same foundation. Show real model-authored software changes and useful collaboration across the applications.

Primary goals, in priority order:

1. Deliver a polished, understandable demonstration with a visible before/after transformation.
2. Make Meta models central to authoring and revising executable capabilities.
3. Demonstrate a reusable foundation through shared contracts, extension lifecycle, and an agent builder present in both hosts.
4. Show scoped information exchange between desktop and web applications.
5. Produce a credible, inspectable engineering portfolio with reproducible setup and honest limitations.

Success means a fresh workspace can run the demo, generate and install a working extension, revise it without losing app data, react to a cross-app change, and retain the installed capability after reload. Passing a scripted happy path alone does not establish general-purpose app generation.

Core philosophy clarified by the user: investigate how application development and software behavior should change when agents are native participants, rather than merely fitting agents into existing app/harness boundaries. This is a design hypothesis and long-term direction toward rethinking an OS from first principles, not a claim that a new OS is already built or that novelty has been established. Point-of-use malleability and bidirectional capabilities are inseparable: communication supplies context and actions that software can compose while being used. The hackathon scope may bound the UI elements, layouts, operations, and permissions; it must not reduce the framework to a fixed menu of demo workflows. Every slice must advance a compelling demonstration of this foundation or a reliable way for people to try it.

## 2. Product boundary

The hackathon deliverable is an application framework/runtime hosted by the existing browser and Tauri environments. Its distinguishing experience is modifying running software in its own context: an agent can inspect the live app model and registered resources/actions, recompose its working interface, and install useful behavior while retaining data. A longer-term OS direction informs the primitives and human/agent participation model; a kernel or OS build is outside the current deadline. Communication is an enabling framework capability, not the product identity.

The user-facing authoring surface should be available in every Mallea app. App developers register their app's data contracts, actions, events, and extension slots. They do not implement a separate bespoke agent builder for each app.

The default Observer, always-present builder capability, and user-created agents have distinct roles. The Observer notices usage patterns and proposes improvements. The builder turns direct requests or accepted suggestions into app changes and user-created agents; it is available in every app without counting as an additional predefined agent. Created agents have identity, purpose/instructions, permitted inputs/tools, trigger, outputs/UI contributions, enabled state, and observable execution history as implemented. A stripped-down executable contribution model is acceptable: a model-authored Surface, bounded Automation, or both, using approved bindings/actions and explicit triggers where applicable. Installed execution can be deterministic; a model call per run is not required. A definition without working execution is insufficient. Do not disguise deterministic reactions as model reasoning.

Hackathon scope is deliberately bounded by a small documented composition language: approved UI primitives, a few layouts, typed bindings, registered actions, and isolated behavior. The bounded region must include a meaningful main application working surface, not only a fixed review-panel slot. New arrangements and permitted data/action combinations should be expressible without adding a workflow-specific branch to the shared engine. Unrestricted trusted-host rewriting and arbitrary native access remain outside the boundary.

## 3. Demonstration scenario

The approved demo is a desktop visual scratchpad and a locally served browser asset-review board. They are distinct apps with different designs, using the same Mallea core, sole default Observer, and always-present builder. Reuse existing code and suitable libraries; the earlier playtest notebook/production board remain legacy evidence, not the current demo product.

The scratchpad displays a bundled image with one editable text annotation and accompanying note. Edit -> Annotation color is initially inconvenient. Real repeated use prompts Muse's Observer to suggest an easier control; acceptance enters normal model authoring, preview, feedback and installation of a working Surface beside the canvas. Preserve meaningful workspace composition rather than a hardcoded final panel.

The review board starts with an older linked asset. The user builds an Automation that, on app open/reconnect after permission/session readiness, checks for a newer saved scratchpad revision and updates the linked image/note once while preserving feedback. Save revision separates publishable data from drafts. A manual run fallback is allowed.

A user-created desktop feedback Surface reads permitted review comments from the browser app beside the canvas. This completes useful effects in both directions; each app renders its own UI. Registered schemas/action references and the limited vocabulary determine what can be composed, not prompt keywords selecting finished workflow templates.

Installed agent contributions may provide a Surface, an Automation, or both. Surface controls and Automation steps may execute deterministically after genuine model authoring; no model call on every click is required. Purpose, access, trigger where applicable, definition, enabled state and latest outcome persist. Model reasoning, authoring and deterministic execution stay distinguishable.

Detailed accepted foundation: FOUNDATION_PLAN.md. Story and future acceptance walk-through: DEMO_PLAN.md. Both are working guides alongside this snapshot; STATUS.md alone records achieved behavior. Public hosted HTTPS connectivity, incompatible app upgrade handling, broad provenance/state identity and a general graphics editor are deferred for this hackathon.

## 4. Three-minute video outline

Follow DEMO_PLAN.md: show different apps and friction (0:00-0:15), real interactions and Muse Observer suggestion (0:15-0:35), build/install/use color Surface (0:35-1:00), saved revision plus web publishing Automation (1:00-1:35), receipt and feedback-return Surface (1:35-2:10), useful repeated operation (2:10-2:35), persistence/model credit/try pointer (2:35-3:00).

Measure and adjust after rehearsal. Transparently label shortened waits and saved-artifact mode. Preserve real generation evidence for Observer, builder Surfaces and executable Automation; do not substitute hand-authored final screens. Retain full/backup real-run footage. The submission includes a runnable repository, not only the video.

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

### Accepted hackathon foundation boundary

Reuse existing React/Tauri, Node/SQLite, MCP, WebSocket, inference, isolation and preview/install infrastructure. Mallea owns the live app model and capability contract. Libraries implement narrow adapters only where their supported APIs fit; do not bend the vision around a library or patch its internals. Assess Fabric.js for basic image/text annotation/export with a roughly two-hour fit check; choose smaller library or narrow Canvas 2D if it fights the contract. Native color input and simple CSS layouts suffice. No dependency is selected/installed by the plan alone.

One local companion owns local storage, grants, model access and routing. Keep a small workspace vocabulary including trusted canvas references, bindings and registered actions; no generic OS, workflow engine or new agent framework. Save PNG/note revisions with stable IDs, revisions and exact content hashes; one small SQLite exchange table/receipt covers broker-observed operations. Do not hash every UI state, build content-addressed storage, or overengineer telemetry.

Muse is the Observer reasoning component over locally collected minimal semantic-event summaries, with explicit opt-in/disclosure, cooldown and shared builder approval. Fully local inference is not claimed. Installed local contributions activate with their app's authenticated connection; no background scheduler. Public hosted-site pairing and incompatible base-app upgrades are deferred.

Runnable source delivery is mandatory with Windows/macOS/Linux instructions; platform success requires actual evidence. Reuse Tauri bundling for native artifacts where practical, but signed installers, bundled Node, auto-updates and binary parity are not gates. Keyless try mode uses labelled actual generated artifacts; fresh inference is explicitly configured. See FOUNDATION_PLAN.md for exact boundaries.

### Slice 001 implementation boundary

The first authoring slice uses SDK 0.2 packages with a model-authored declarative UI tree and a pure JavaScript review function. The trusted compiler emits escaped markup from allowlisted elements, bindings, styles, and actions; it does not compile arbitrary generated React or install dependencies. The UI runs in an opaque-origin sandboxed iframe, and behavior runs in the existing isolated worker. Initial behavior is bounded to blocking all unreviewed tasks or blocking critical tasks while warning for ordinary tasks. This proves the lifecycle without claiming arbitrary app generation.

Use Node 24 built-in SQLite for immutable package versions, drafts, active version, and host-owned review state. Preview uses a separate in-memory data copy. A loopback service with origin checks and a per-process browser session token supports the local slice; production workspace authentication, app registration, rollback controls, and full created-agent records remain later milestones.

### Capability audit and the next slice

After Slice 001, distinguish package validity from fulfillment of a user request. An audit showed that layout composition and computed labels work, while an unsupported threshold rule could silently become an existing supported policy. The authoring response now permits a validated unsupported result containing a reason and an alternative; it ends without a draft or activation. This is a model-assisted feasibility response, not a deterministic proof that all unsupported requests will be detected. Preserve request-specific checks and explicit preview review.

Slice 002 will prioritize distinct notebook/board ownership, app-provided capability descriptions, actual Windows native compatibility, and authorized cross-app evidence exchange through the planned MCP gateway and event connection. The shared builder should consume app definitions rather than a hardcoded production-board context. Keep domain validators with the app contract; the framework enforces generic isolation, shape, and access constraints. Verify routing with a third test instance without adding a third polished demo app.

A configurable revision-gap threshold is a bounded follow-on candidate after the cross-app slice passes, not committed Slice 002 scope. It requires an explicit policy parameter, user-visible behavior examples, and an independent host-owned behavior oracle at boundary values. Do not enable it by weakening the existing validator or silently treating a different policy as success. Wider inputs, forms, actions, or multiple panels require their own registered app capabilities and acceptance checks.

### Slice 002 implementation decisions

Native testing found that srcdoc inherits a content policy which prevents the trusted binding script from running. Serve compiled panel markup through short-lived random frame handles on the loopback service; keep the opaque iframe sandbox, restrictive frame policy, and parent source/channel/action checks. Frame markup contains no workspace snapshot or session token. Allow only the loopback service frame and WebSocket destinations in the native host policy.

Pin the official @modelcontextprotocol/sdk maintenance-line version 1.32.2, ws 8.22.0, and zod 4.6.7. The gateway supports SDK Streamable HTTP for external local clients. Runtime-to-gateway calls use the SDK linked in-memory transport inside the trusted service; the gateway routes a permitted owner read over the owner app outbound WebSocket. Presence and revision events use that ordinary WebSocket connection. Keep these transport responsibilities explicit.

Persist notebook observations, board task links, per-app package versions/drafts/active pointers, scoped grants, and deduplicated edit results in SQLite. Migrate legacy data transactionally after a consistent SQLite backup; retain legacy tables for recovery. Local bootstrap credentials permit registration of known workspace apps, then per-instance sessions and one-use connection tickets scope subsequent calls. This is a local trusted-workspace model, not remote-user authentication. The SDK remains review-oriented; app definitions supply domain descriptions and validators without claiming arbitrary app compatibility.

### Live application model: next implementation boundary

Introduce a versioned, serializable app model for a meaningful mutable working surface. It should describe views/layout, schema-checked resource bindings, local interaction state, declared actions/behavior, and the identities/authority of participating agents. Keep the builder capability available in both hosts, reserve the framework-supplied agent identity for the Observer, and make user-created agent definitions explicit app entities. Do not claim autonomous scheduling from the presence of a metadata record alone.

Choose a small initial primitive/layout set during the contract spike: for example text, image, badge, button, text input, toggle/select, and repeated items, with stack, split, and grid layouts. This list is illustrative until the spike fixes its schema. The engine must obtain field and action names from registered app schemas rather than observation/review constants. Pure transformations remain isolated; writes go through typed host capabilities with explicit grants. New app models validate and preview before atomic activation, preserve authoritative data, and reject stale proposals.

The initial two app adapters may remain domain-specific. The shared renderer/binding/action engine must handle a small unrelated fixture using the same published vocabulary without new domain branches. Keep the legacy review SDK through an explicit compatibility adapter while migrating; do not silently relabel it as the generalized foundation. Bidirectional capability execution and model-driven interface mutation must be validated together.

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

### Observer: the sole default agent (planned)

Supply the Observer as the only default agent in every Mallea app. It notices permitted app-usage patterns and suggests changes that could help that user: a shortcut control, a different view, a derived panel, or a user-created agent. Default availability is distinct from observation being enabled; retain explicit observation controls and the scoped collection policy below. The Observer is part of the target framework experience, not an unrelated optional assistant. Implement its suggestion-to-builder flow once the builder can activate real app-model changes; use that same authoring path.

For the first version, observation is off until the user enables suggestions for the app. Observe only allowlisted semantic events emitted by Mallea apps, initially opening Edit and changing annotation color. Disclose that a minimal local pattern summary is sent to configured inference for Muse reasoning. Do not capture raw keystrokes, screen recordings, unrelated applications, or note contents. Use app/entity IDs and event types; remove identity details before inference where not required. Disable observation and clear the session buffer when the setting is turned off. No weight training or reinforcement learning is involved.

Keep a session-local buffer of at most 50 events with a 30-minute expiry. A cheap deterministic gate identifies an opportunity, initially repeated navigation to the annotation-color control. After a brief idle period, one bounded model request receives a minimal event summary plus the app's permitted capabilities. The model may return no suggestion; it must not invent capabilities or treat event content as instructions. Do not call the model for every click. Allow at most one visible suggestion, suppress duplicates, and use a ten-minute cooldown after a suggestion or dismissal. Clear pending requests when observation is disabled and discard their late results.

Show a quiet in-app suggestion with an evidence-backed explanation, for example: You repeatedly opened Edit to change annotation color. Would keeping that control beside the canvas help? Offer Preview change, Not now, and Do not suggest this again. An accepted suggestion becomes an editable builder request with its evidence and permitted scope. Acceptance opens the normal preview/install flow; it does not authorize automatic installation or broaden permissions. A dismissed suggestion must not repeatedly interrupt the same workflow.

Demo integration: begin with real repeated app interactions, show the Observer proposing a useful app change grounded in the usage summary and registered capabilities, and accept it into the normal builder. Preserve the visible app transformation, follow-up composition, and bidirectional effects. Demonstrate the actual observation setting/trace; do not substitute a timer, a canned suggestion, or a fixed workflow template. Fit this into the opening problem/generation segment of the three-minute story.

Acceptance: enabled observation produces only approved event fields; disabled observation makes no inference requests; repeated interactions produce at most one eligible suggestion; a normal one-off action produces none; unsupported proposals are rejected; dismissals and cooldowns work; accepted suggestions retain the builder's normal validation and permission boundaries. Cover these with local tests before a bounded live model check. Treat success as one useful suggestion in a demonstrated workflow, not a claim of general understanding of user intent.

### User-created agents and classic-application adapters

The builder may begin with a small execution vocabulary, but apps built on Mallea must retain the ability to create agents in app. A future Mallea word processor could let a user create an agent that reads approved document content, produces a summary, and adds/rearranges a summary panel; appearance and color changes are model edits too. This is an illustrative example, not a commitment to build a word processor or a general document-processing product for the hackathon.

Likewise, the user's spreadsheet/current-month-folder example illustrates the Observer noticing repeated navigation and proposing a useful dynamic shortcut. Do not build a spreadsheet app or claim folder navigation is available without an actual permitted app/connector capability.

Allow future trusted connector adapters to expose classic-application data/actions through the same registered resource/action schemas and permissions as Mallea-owned capabilities. An app or user-created agent can consume approved connector data inside its model/agent outputs. Use existing connector/MCP interfaces where suitable instead of requiring all source apps to be rebuilt. This is an extension boundary and future compatibility direction; no classic-app connector integration is currently implemented, and it does not make the external application's own UI malleable through Mallea. Keep credentials in the trusted adapter/service and gate access explicitly.

## 9. MCP and cross-app communication

Cross-app scope boundary: Mallea apps exchange typed data, state updates, events, and permitted action requests/results using the existing MCP gateway and connection approach. Each app owns and renders its own interface, and its builder changes its own local app model. Transferring, importing, embedding, mirroring, or synchronizing another app's visual components, rendered UI, or view/component tree is out of scope for this MVP. Received information may be presented through the receiving app's own UI primitives. Shared framework code/components and evidence images as data resources remain in scope; they do not constitute transferring a running app's visual elements.

Adopt MCP through an existing SDK for tool/resource exposure and agent-to-capability calls where practical. Do not invent a competing tool schema and wire protocol without evidence that MCP blocks the demo. Pin a supported SDK/protocol combination and verify its actual capabilities before depending on optional features.

MCP does not by itself provide private workspace membership, app-instance discovery, routing to an offline desktop, authorization policy, or domain synchronization. Maintain a small workspace registry with app instance ID, app type, owner/workspace, capability versions, and connection availability.

Start with a service-hosted MCP gateway exposing authorized app capabilities. Browser and desktop hosts establish outbound authenticated connections to the workspace service. The browser does not accept inbound server connections. Route host-owned actions over the existing connection; do not expose a public HTTP server from each desktop.

Use an ordinary event channel, such as WebSocket, for app presence and domain changes. Reuse MCP resource notifications where supported and useful, but do not mistake them for a durable application event log. This split preserves standard agent tool calls while keeping live UI updates simple.

Current demo contracts include reading a saved design/image/note revision, setting local annotation color, publishing one linked asset revision and reading/adding review feedback. Use stable entity IDs, revision numbers, operation IDs for retry deduplication, and explicit ownership. Avoid generic two-way database synchronization.

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

## 11. Remaining execution sequence

Submission target: November 4, 2026 morning Eastern Time; exact hour unknown. Freeze core features by November 1 evening and protect November 2-3 for clean setup, platform evidence, target-Meta/native rehearsal, recording and submission. Dates below are budgets, not completion claims.

| Slice | Milestone / observable result | Target |
| --- | --- | --- |
| 003 | M1: two distinct apps, working annotation canvas, real model-authored installed native workspace/color Surface, saved-data read and source-run instructions | October 28-29 |
| 004 | M2: Muse-backed Observer suggestion through same builder, direct user-created feedback Surface, useful effects both directions | October 29-30 |
| 005 | M3: model-authored web-open publishing Automation, saved-version receipt, labelled real-artifact try mode, cross-platform run helper and handoff | October 30-November 1 |
| 006 | M4: clean-machine/platform evidence, full actual Meta/native rehearsal, <=180-second video and reproducible submission | November 2-3 |

Follow SLICES.md and SLICE_003.md through SLICE_006.md. Slices 001-002 remain completed evidence. Prior broad Slice 003 is archived; this sequence replaces its scope. Read status/source/goal and verify baseline before each slice, track numbered work units, and finish with milestone/passed acceptance/incomplete report plus exact user test instructions and README gate.

Use configured development inference for iteration and focused direct Meta checks after substantial milestones. No automatic fallback or unbounded evaluation. Cut editor/primitive breadth, decorative polish and optional installer work before core Observer, point-of-use composition, both communication directions, persistence or runnable delivery. Record any required core scope change explicitly.

## 12. Validation and acceptance gates

Provider gate: both configured adapters can complete a minimal request and a genuine tool-call round trip. Streaming is desirable but not a prerequisite for correctness. Unsupported options produce actionable errors.

Generation gate: a model can build an extension from the SDK documentation, receive actual validation errors, and produce a usable result within the bounded loop. Try a small variation on the demo request to detect dependence on a single memorized prompt.

Lifecycle gate: install, refine, disable and reload installed contributions; restore a compatible earlier definition only where existing storage makes this small. Base-app upgrade compatibility/migration is deferred for this fixed-version PoC. Verify retained state and rejection of invalid packages. A failed revision must not replace a working package.

Communication gate: verify authorized cross-app reads/calls, rejection of unauthorized capabilities, duplicate-event handling, stale revisions, disconnection feedback, and generic routing across three registered instances. Reconnecting clients should refresh authoritative state rather than assume no events were missed.

Behavior gate: color Surface edits the real annotation; preview is isolated; only newer saved image/note revisions publish; repeated open/reconnect does not duplicate updates; unsaved drafts do not publish; feedback is preserved and appears in the native Surface. Observer uses real events and bounded inference. Disable/revoke/offline paths prevent unauthorized new actions. Closing a view does not disable active-app execution.

Demo gate: both actual runtimes participate, the target direct Meta model authors the capability, no credentials appear, and the full story fits three minutes with any time compression identified.

Run focused unit/contract tests for permissions, schemas, revisions, and lifecycle transitions. Use one end-to-end scenario plus manual visual checks in browser and desktop. Avoid large test suites that only mirror trivial implementation details.

## 13. Required deliverables

- Shared framework runtime and documented app registration/extension SDK.
- Working local browser asset-review board and actual desktop visual scratchpad, visibly different designs.
- Built-in agent builder reachable in both apps, with persisted created-agent records.
- Observer as the sole framework-supplied default agent, turning an evidence-backed usage-pattern suggestion into an editable builder request, with observation controls, dismissal, and cooldown.
- Generic configurable inference interface with validated development and direct Meta configurations.
- Model-authored Surface/Automation contributions with validation, isolated preview, install, refinement, disable and reload persistence; deterministic execution labelled.
- Reused workspace registry/MCP gateway and permitted saved-image/note publication plus feedback return; small broker-exchange receipt.
- Synthetic demo data, screenshots, and a repeatable reset/setup workflow.
- Focused verification evidence and honest limitations.
- Runnable source handoff, keyless labelled real-artifact try path, parallel Windows/macOS/Linux README instructions and evidence matrix, architecture/SDK notes, credential placeholders only and demo runbook. Native artifacts via existing Tauri tooling where practical; signed installer parity is optional.
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

The Python inference sample was reviewed during prior compatibility work (STATUS.md); reuse the generic adapter rather than repeat that investigation. Preserve sample contents and keep secrets out of outputs. Build the editor independently here. FOUNDATION_REVIEW.md is historical input: accepted hackathon deferrals and demo choices in FOUNDATION_PLAN.md supersede its hosted-site-first and upgrade-handling recommendations.

Confirm hackathon rules, deadline, allowed model access paths, and submission requirements when available. Validate the submitted demonstration against those requirements; retain direct Meta-powered demo validation.

At the end of every slice, review the root README. Update it whenever behavior, supported features/limits, setup, run/test steps, or platform evidence changed, preserving experience-first order and parallel Windows/Linux/macOS instructions. If no update is needed, record that review explicitly in STATUS.md. A slice is not complete until this documentation gate is met.

Record new evidence in STATUS.md. If evidence changes a plan decision, create a new immutable snapshot with only the affected passages changed. All other bytes must remain identical. Follow docs/README.md; never silently edit this baseline.

## 17. References and evidence status

- Configured inference endpoints: tool-calling and structured-output behavior require actual API testing; configuration details remain local.
- Meta model catalogue: supplied by the user from the logged-in developer page. Spark 1.3, Contributor, and Wonder descriptions are catalogue claims, not locally benchmarked results.
- MCP SDK documentation: https://ts.sdk.modelcontextprotocol.io/server . Use a supported pinned implementation; verify version-specific behavior during integration.
- Tauri architecture: https://v2.tauri.app/concept/architecture/ . Shared web UI plus native host; generated plugin execution requires its own boundary.
- AgentRx: https://www.microsoft.com/en-us/research/blog/systematic-debugging-for-ai-agents-introducing-the-agentrx-framework/ . Inspiration for evidence-backed diagnostics; a full research-framework implementation is outside scope.
- Malleable software: https://www.inkandswitch.com/essay/malleable-software/ . Conceptual context, not a claim of novelty for every individual feature.

Research suggestions whose contents could not be verified must not be treated as implemented requirements or supporting evidence.
