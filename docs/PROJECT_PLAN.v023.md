# Mallea: a desktop application engine for malleable software

Accepted product rebase: October 30, 2026. This plan supersedes v001-v018 and their browser/Observer-first execution sequence. The user explicitly authorized an in-place documentation rebase; prior snapshots remain unchanged as historical evidence. Current implementation evidence belongs in STATUS.md. Features here are targets until verified there.

## 1. Purpose and non-negotiable outcomes

Mallea is an application development framework and local execution environment. AI-native software should be malleable while people use it. Every Mallea app has a Meta Muse-powered Shape Your App capability, can expose typed data/state through its own MCP interface, and can cooperate with other permitted Mallea apps on the same host.

The product has three visible concepts: Engine supplies shared services; Surfaces define application interfaces/data interactions; Automations connect permitted events, operations and model reasoning. Apps run as normal desktop applications. The dashboard inspects/manages them and creates projects; it does not contain or mirror their running interfaces.

Required demo outcomes:

1. Dashboard shows two independently running desktop apps, their identities, authors, purpose, Surfaces and declared sharing.
2. Fieldnote and native Parcel are useful ordinary apps, built using the same Surface API used by the agent. Change appearance, add a working element and rearrange a Surface without losing unrelated work or restarting the app.
3. Show approved automatic data synchronization and revocation at app/Surface scope. Each app renders its own interface.
4. Show one genuinely Muse-powered Automation, beyond UI authoring, with inspectable input/trigger/output permissions.
5. Show an attractive, explicitly illustrative app-store catalogue with local artwork and named concepts; no fake working installs, reviews or adoption figures.
6. Create a new project in a selected folder, compile/launch a real blank Tauri app containing only framework Shape access, and build a small working app incrementally. The resulting definitions/data persist across restart. New Surface edits do not require native recompilation.
7. Other machines can run documented source/build steps. Windows is the reference; Linux/macOS success requires actual tests.

Web product delivery, Observer, remote routing, peer discovery across machines, training/RL and a new OS are parked. Embedded WebViews and developer frontend tooling remain implementation technology, not a supported browser product.

## 2. Keep React/Tauri; change the application model

Tauri provides native windows, lifecycle, OS integration and app packaging. React renders the live Surface model. Mallea Core owns app registration, schemas, data, editing, agent tools, permissions, routing, persistence and Automations. The existing Node/SQLite service is the starting engine implementation; no new backend language or service fleet is required.

Reuse the current validator, targeted edit transform, renderer, bounded model loop, version/install logic, official MCP SDK, owner connections, Fabric adapter and regression tests. App-specific behavior remains registered adapters. Remove hardcoded known-app branching from the generic host/engine path as it becomes an actual blocker. Do not wrap an entire app in an opaque trusted component to claim Surface coverage.

E002 must migrate Fieldnote, Parcel and the blank-project app onto the same independent Surface/model/event/action registry, renderer and authoring tools. This includes their ordinary UI and framework panels; the existing apps are not a legacy exception while only new apps use the framework. Preserve saved artwork, review feedback, local notes, grants and compatible customizations through a recoverable migration. Domain-specific behavior may remain registered adapters, and canvas primitive internals remain renderer code. Acceptance exercises scoped/global edits and working behavior in all three app paths, not only the new blank app.

The game-engine analogy is useful: editor/dashboard, shared runtime, project format, primitives and independently built applications. It does not imply container virtualization or production process isolation.

Official Tauri references supporting the host fit: [configuration/windows](https://v2.tauri.app/reference/config/), [directory picker](https://v2.tauri.app/plugin/dialog/), [platform prerequisites](https://v2.tauri.app/start/prerequisites/). This stack choice is an engineering assessment based on those APIs and the locally verified native renderer/build.

## 3. Minimal core contracts

### App

Stable app ID, name, author, purpose, icon/cover, SDK version, registered data models, Surfaces, capabilities and local launch/project metadata. Instances add their own ID, connection/lifecycle state and last-seen time. Runtime discovery is live presence, not an inference that a process remains running forever. Project paths and secrets are local configuration, not shared public examples.

### Surface and element

A Surface is a separately identified, versioned collection of elements, typed bindings, declared events/actions and placement. Its record includes owner app, purpose, data-model references and lifetime: persistent by default, session when explicitly requested. Elements have stable IDs and inspectable properties/events/operations. Layout, visibility, appearance, values and permitted behavior are editable through the Surface API while the app runs.

All app-owned visual content, including toolbars, menus, settings and framework panels, is rendered through that API. System-owned builder/permission/settings Surfaces have framework ownership and appropriate edit rights; being rendered through the API does not grant an app permission to change engine credentials or approval policy. OS window chrome and primitive renderer internals are implementation boundaries. A canvas is a registered primitive with explicit properties/events/actions, not an escape hatch hiding arbitrary app UI. Keep a reliable framework recovery entry if a customization hides normal navigation.

### Data model and registry

Use one local engine-managed SQLite registry for this PoC. Store app manifests, Surface/element definitions, typed model schemas, bindings, events/actions, grants, Automation records and revisions there, namespaced by app/Surface/model IDs. Reuse the existing configured workspace database; back up/migrate necessary tables rather than creating ambiguous alternate live databases. Large app-owned images may remain referenced resources.

Data is not UI text embedded in a definition. Bindings explicitly link an element to a typed field/collection. Start with text, color, boolean, enum, date, image reference and simple bounded collections needed by the demo. Existing text/color support alone cannot build a useful blank app. Extend schemas only for real composed behavior; no universal database editor or arbitrary expressions.

Transactions publish validated definition/data changes with revision notifications. Connected apps update affected Surfaces without reload. Compatible data survives presentation edits, rearrangement and restart. Removing a Surface is distinct from deleting its data. Session-only Surfaces activate for the app runtime session, are discarded when that session ends and do not resurrect on restart; persistence of linked data is a separately declared choice. A heartbeat/reconnect grace handles crashes, not a general scheduler.

### Agent capability

Every app and the dashboard use the same bounded authoring/runtime tools: inspect model, discover permitted resources/actions, propose/create/edit Surfaces and data models, preview, execute permitted operations and install approved changes. The agent gets the full declared Surface API within the caller's permissions. It does not receive arbitrary Rust/filesystem/network execution or model credentials. No per-intent finished UI recipes. Existing targeted operations are the base, extended for Surface/model/event/action records.

### Contextual and app-wide authoring

Every registered app element offers framework context actions: Modify this surface and Set Automation. Modify opens the shared Shape panel scoped to the owning Surface, focusing the clicked element and its registered models/bindings/events/actions. Keep a visible scope label and enforce proposal scope in the engine; the agent cannot silently edit other Surfaces. App-wide Shape remains independently available with all permitted Surface definitions in that running app, for broader composition and rearrangement. Cross-app resources are accessible only under existing grants. No extra resident agent or separate builder implementation.

Enable Set Automation only if the element exposes a declared usable trigger, including an explicitly observable data-change event. A genuinely static text/list has no such trigger and shows a disabled item with a short reason. Read-only does not automatically mean static: a bound list with a declared items-changed event can qualify. Do not infer trigger capability from raw DOM events or data presence alone. Resolve nested clicks to the owning registered Surface/element. Framework/system Surface ownership still applies; native OS chrome is not an app element.

## 4. Discovery, MCP and permissions

Every app publishes an app-specific MCP interface by default. For the PoC the engine can host separate app-scoped MCP endpoints using the existing SDK/transport and route to the connected owner. That is a per-app server facade, not one unscoped catalogue granting access to all app state. A separate listener/process per app is unnecessary. Endpoint names and discovery records identify the app and typed resources/tools.

Discovery automatically exposes approved metadata; it does not grant data access. A grant identifies requesting app and Surface, providing app and Surface/resource, permitted read/write/action operations, and relevant model scope. The engine and owner check those grants at execution. UI edits cannot fabricate caller identity or widen authorization. Pause/revoke blocks subsequent reads/actions/Automation runs; already copied data is not retroactively erased.

Auto-sync means a previously approved binding/subscription reacts to source revisions, not automatic approval of a new relationship. Broker events carry resource IDs/revisions; receivers refresh permitted data and render locally. Use expected revisions, operation IDs, deduplication and loop prevention. No cross-app component/view-tree transfer. App/instance/Surface sessions remain a local single-user PoC, not a production hostile-app security claim.

Future trusted P2P and encrypted remote routing fit a transport adapter boundary. Do not implement remote accounts, encryption protocols or distributed discovery for this submission.

## 5. Automation

An Automation is a persistent executable definition: ID, owning app/Surface, purpose, allowed inputs, trigger, bounded steps, optional Muse transformation, output binding, permissions, enabled state and latest outcome. It uses the same declared data/actions/events as a manually operated Surface. The builder authors it; runtime execution is real, not descriptive metadata.

Support only explicit run, relevant data-change and app-ready/reconnect triggers needed by the demo. Use registered operations such as field update, collection append, approved capability read/write and a bounded structured model transform. No arbitrary JavaScript, workflow DSL project, cron or long-running autonomous agents. Installed deterministic steps need no LLM call; semantic transformation uses Muse and is visibly distinguished.

Recommended semantic example: Brief -> Concepts. After a short idle pause, Muse reads permitted current text and updates a concept/constraint list in another Surface. One in-flight run, bounded output, stale-source revision check and no per-keystroke calls. A linked native app can receive the result after a separate grant. Deterministic example: selected date -> available demo slots using a declared local availability table; do not present it as a real calendar integration. See AUTOMATION_IDEAS.md.

### Plain-English Automation authoring

Set Automation opens the shared builder in a three-step flow: When should it run? -> What should happen? -> Where should the result go? The clicked source is preselected. Triggers are presets in plain English, such as When I type, When I click, When I choose a value and When I leave this field, shown only when supported by that element. An initial typing trigger waits for a short pause; UI explains that behavior rather than issuing model calls per keystroke. Trigger and input are separate internally: a button click can read another approved field.

The transformation declares which data is read, whether a local operation or the shared Meta model processes it, and the typed output. Destination selection lists compatible writable element bindings in this app or permitted elements of shared Surfaces in other running apps, with app/Surface/element names. Sharing/discovery alone does not grant write access. Incompatible or unapproved targets are clearly unavailable; the picker does not transfer UI. Define replace versus append behavior and preview a concise trigger/read/processor/destination/access summary before enabling. Persist the Automation record and show pause/latest outcome. See CONTEXTUAL_AUTHORING.md for exact interaction rules.

## 6. Dashboard, catalogue and shared model settings

The dashboard is a Mallea app/control surface. It shows running apps and a detail view with actual registered metadata, Surface/model inventory, permitted sharing and recent activity. Show connection state and counts from real registry data; CPU/memory statistics are optional and must not be invented. Apps keep running when their dashboard detail view closes. Registered local apps can also be opened from their dashboard cards through a trusted Core operation using private launch metadata. Already-running apps are not duplicated; missing builds or registration produce an actionable message. This is local launching, not installation or a process manager.

Shared model settings are engine-owned. The dashboard configures one active Meta model/profile/key used by every Mallea app. Only trusted registered Meta model identities are selectable; a user-entered arbitrary model label is not proof of Meta provenance. Reuse the generic inference adapter, with explicit development/demo profile selection and no hidden production fallback. Existing environment configuration remains available for developer testing until the settings path is implemented. Production evidence still uses the explicit target Meta configuration.

Keys stay in the trusted engine/native credential boundary, never model context, app data, generated definitions or browser bundles. Session-only key entry is acceptable initially; persistent credential storage uses an established OS facility, not homemade encryption or plaintext registry values. App-facing APIs report model identity/readiness, not secrets.

The catalogue uses original bundled graphics and named concept apps, clearly labelled illustrative. There is no submission dependency on marketplace backend, distribution, payment, ratings or working Install for dummy entries.

## 7. New-project creation and build

Dashboard chooses a parent folder and project name, previews the output location and creates a new project without overwriting existing files. Native folder selection and compilation are trusted registered operations. Generated Surfaces do not obtain general filesystem commands.

Scaffold a portable Tauri project plus Mallea app manifest, pinned runtime/SDK artifact and blank default app definition. The project must build outside the original checkout with relative references; no dependency on a private absolute source path. Compile once to create its native host. Launch a genuine blank app with only framework Shape access, register its identity, then let the user add models/elements/actions/Automations incrementally. Store dynamic definitions externally through the engine; do not recompile on every Surface edit.

Prototype the project build path early in E001 using an ignored test folder. The exact packaged-runtime artifact format is fixed by that spike, not by speculative packaging work. Native build latency and first-install toolchain requirements are measured; compressed video waits are labelled. A canned prebuilt final app is not evidence of scaffolding from blank.

## 8. Delivery sequence and acceptance

| Milestone | Required result |
| --- | --- |
| E1: engine and desktop hosts | Generic app identity/registry, real Fieldnote and Parcel native windows, live Surface/model records and early scaffold-build proof; existing malleability/data tests retained |
| E2: malleable application core | Independently owned Surfaces/models/events/actions, scoped and app-wide editing, persistent/session lifetime, migration of Fieldnote/Parcel/blank-project apps to that same runtime, and a small app built incrementally from blank |
| E3: dashboard and project creation | Dashboard built through the Surface API, actual app inventory/detail, shared Meta settings, illustrated catalogue and real user-selected-folder blank app build/launch |
| E4: permissioned Automation | App/Surface-scoped MCP access, approved auto-sync, three-step English Automation authoring and one real Muse transformation with bounded execution |
| E5: reproducibility and submission | Fresh-run instructions, native/platform evidence, final direct-Meta rehearsal, three-minute video and runnable source |

Execute E001-E005 as defined in SLICES.md; track work units in STATUS.md. Do not claim a whole milestone complete from one passing component. Every slice ends with README review, exact user tests, expected results, known limits and separate automated/user evidence.

Current baseline on rebase: 36 tests and TypeScript pass. Existing Windows native/targeted-edit checks are useful historical evidence. Dashboard, native Parcel, dynamic blank-app schemas, Surface-scoped grants, automatic sync and executable semantic Automations are not implemented merely because predecessor mechanisms exist.

## 9. Schedule and cuts

Submission target: November 4 morning Eastern Time; exact cutoff hour remains unknown. October 30-November 1 is the remaining feature window. November 2-3 stays reserved for freeze, clean setup, rehearsal, recording and submission. Validate the riskiest blank-project compile/launch path first, not after polishing dashboard cards.

Keep dashboard/catalogue shallow and focus on one meaningful end-to-end Automation. Cut live OS metrics, fancy marketplace navigation, alternate models, complex editor features and optional Automation variations before cutting point-of-use change, two-way permitted data, blank-project proof or real Muse participation. Do not introduce a framework rewrite unless a measured blocker shows the current stack cannot serve the vision.

## 10. Documentation and evidence discipline

The October 30 rebase is an explicit exception authorized by the user: active mutable guides and README are rewritten coherently, prior versions preserved in archive/desktop-engine-rebase. v019 is a new baseline rather than an artificial localized edit to an obsolete product plan. Future plan snapshots resume exact byte-preserving copy/localized-edit rules unless the user directs otherwise.

Root README stays concise/product-facing and distinguishes current prototype from planned engine features. Keep private configuration out of shared docs, no actual machine paths, and parallel Windows/Linux/macOS commands with untested platforms marked. No runtime/source/user-data deletion is authorized merely to make the directory look clean. Park legacy browser/Observer code and evidence without spending the feature window on cleanup unrelated to acceptance.
