# Desktop engine architecture: target and current gaps

Governed by PROJECT_PLAN.v028.md. This guide describes implementation boundaries; it is not a completed-system claim.

## Runtime roles

- Tauri native host: window/lifecycle, trusted OS integration, app identity and project build/launch operations.
- React/Surface runtime: renders declared app and framework Surfaces, dispatches registered events/actions and applies live revision updates.
- Core engine: local app/Surface/model registry, SQLite persistence, shared Meta inference, scoped sessions/grants, app-specific MCP facades, owner routing, subscriptions and Automation executor.
- Dashboard: a Surface-based control app consuming actual Core metadata. It does not embed other app UIs or own their normal lifetimes.

Reused code: apps/desktop native shell; packages/sdk Surface schema/targeted transforms; packages/runtime renderer/builder; services/workspace Node/SQLite registry/author/gateway/owner connection; existing Fabric/review adapters. E001 supplies native identity/manifest bootstrap, dynamic app registration, independent native Fieldnote/Parcel and a portable blank-project runtime. Artwork/review handlers remain specific registered adapters. E002 routes ordinary app and framework UI through independent Surface/model records and the same native LiveApp renderer; SDK 0.3 paths remain only for compatibility checks/recoverable migration. E004 adds owner-approved requesting/providing Surface resource grants; engine-mode legacy app access switches cannot authorize data transfer.

## Persistent graph

App -> Surface -> elements. Surface -> model references -> typed fields/collections. Element -> binding/event -> registered operation. Automation -> approved inputs/trigger/steps/output. Grant -> requesting app/Surface + providing app/Surface/resource + allowed operation. Definitions/data have distinct revisions. Current activation uses existing transactional validation/version patterns, expanded beyond one workspace artifact.

The central registry is the chosen local PoC store; apps remain logical owners of their data. No UI definitions are copied between apps as a sharing mechanism. Subscribe to resource identity/revisions, authorize owner reads, update recipient data, then render the recipient's own Surface.

## Agent and model boundary

The shared agent runtime can inspect and manipulate authorized Surface/data/action records. Meta model selection/key are engine-owned; all apps use the selected profile. App payloads, generated projects, registry discovery and model context exclude key values. Secrets use session memory first or an established native credential facility when persistent storage is added. Model output is validated; failed/stale proposals cannot mutate live state.

Dynamic behavior comes from typed events and bounded registered operations, optionally a Muse structured transformation. No arbitrary generated Node/Rust modules, unrestricted network or universal expression engine is required for the PoC. A general app can still be composed from useful primitive data operations, collections, inputs and outputs.

## Native project delivery

Installed delivery is separate from developer project builds. I001 bundles private Node, Core, the shared Tauri host and Fieldnote/Parcel. A versioned runtime contract supplies trusted host/resource paths to Core; a narrow platform adapter starts or reconnects to detached Core and opens the dashboard. Installed data lives outside program files and developer data. Installed project creation is denied in Core and disabled in Surface presentation. User-entered model endpoint, exact model ID and key are session-only; Shape and Muse execution are gated before inference. Source project creation remains supported. Windows and macOS release gates, startup/shutdown, installer commands and verification limits: INSTALLER.md and STATUS.md.

A project contains an app manifest, pinned Mallea runtime/SDK artifact, Tauri shell/template, app-owned metadata and normal build scripts/locks. It builds without an absolute link into the creator's checkout. The initial default definition is empty except framework Shape. Subsequent model/schema/Surface revisions load from Core without native recompilation. The E001 format copies the built frontend and native sources/lock into each project, with its own pinned Tauri CLI dependency and private local host configuration. It compiled outside the original checkout.

Core can initially be launched explicitly from source. Automatic sidecar installation/engine startup is delivery work only after the source path works; no bundled runtime/installer claim is made prematurely. Closing the dashboard is distinct from shutting down Core.

## Current verification boundary

E002 Windows evidence includes the shared native runtime, scoped/global live editing, typed collections, session expiry and native export; user Surface-editing acceptance is in STATUS.md. E003 adds the Surface-based dashboard, actual registry cards/details, shared session Meta settings, original concept illustrations and a graphical creator reusing the portable scaffolder/Tauri compiler. E004 adds resource metadata, owner-approved Surface read/write/action grants, approved two-way data subscriptions and executable local/Muse Automations. Native evidence and pending user acceptance are separated in STATUS.md and REHEARSAL_E004.md. Browser product support and Observer are parked.

Automation definitions and permissions live in Core's existing SQLite store. services/workspace/automations.mjs derives resources from the same app definitions, uses existing owner sockets for cross-app I/O, and rechecks scope before commit. automation-adapters.mjs supplies only bounded artwork/review transformations. The runtime's shared automation-adapter.tsx renders the three-step builder and manager from system-owned Surface definitions. No additional workflow engine or transport framework was introduced. Source/destination stamps, pause/revoke checks, debounce, output bounds, deduplication and copy-origin tracking constrain execution. This is one-transformer local-host composition, not an unrestricted agent executor. See SURFACE_API_004.md for the implemented contract.

Dashboard app content uses the same LiveApp renderer and authoring tools. Engine-owned settings/creator/concept panels are stored as system Surfaces. Only a narrow password input is a credential primitive; the settings UI is not an opaque component. A dashboard-only native control capability protects settings/build routes and never enters app-facing records. Model jobs resolve the active configuration at job start; changing it affects subsequent jobs across apps, with no fallback. Session replacement keys are kept in Core memory; restarting restores the environment. This is a local single-user PoC boundary, not hostile-process isolation.

Project creation serializes builds, uses a native-selected parent folder, refuses collisions, copies pinned runtime/native sources and compiles through the existing Tauri CLI. Compiler cache reuse stays local; the generated sources contain relative runtime references and their own Cargo lock. Build failure retains files. Private local project locations/host credentials live under ignored runtime configuration. Closing the dashboard does not close Core, other apps or an in-progress build. Stopping Core stops its managed build processes; there is no build queue, remote service or real catalogue distribution.

Dashboard launching uses a registered Surface action and the same trusted native capability as engine settings/creation. Core resolves the app's private launch registration, uses the project's own compiled executable when recorded, and otherwise uses its registered shared host. It rejects unknown IDs, missing builds and mismatched local identities; already-running apps are not duplicated. The shared native-launch helper is reused by CLI launching and project creation. Launching does not install software or grant access to another app's data.
