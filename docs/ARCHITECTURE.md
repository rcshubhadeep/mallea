# Desktop engine architecture: target and current gaps

Governed by PROJECT_PLAN.v021.md. This guide describes implementation boundaries; it is not a completed-system claim.

## Runtime roles

- Tauri native host: window/lifecycle, trusted OS integration, app identity and project build/launch operations.
- React/Surface runtime: renders declared app and framework Surfaces, dispatches registered events/actions and applies live revision updates.
- Core engine: local app/Surface/model registry, SQLite persistence, shared Meta inference, scoped sessions/grants, app-specific MCP facades, owner routing, subscriptions and Automation executor.
- Dashboard: a Surface-based control app consuming actual Core metadata. It does not embed other app UIs or own their normal lifetimes.

Current code to reuse: apps/desktop native shell; packages/sdk Surface schema/targeted transforms; packages/runtime renderer/builder; services/workspace Node/SQLite registry/author/gateway/owner connection; existing Fabric/review adapters. E001 now supplies native identity/manifest bootstrap, dynamic app registration, independent native Fieldnote/Parcel and a portable blank-project runtime. Artwork/review handlers remain specific registered adapters; grants remain predominantly app-level. Independent Surface/model composition and complete framework UI coverage are E002 gaps.

## Persistent graph

App -> Surface -> elements. Surface -> model references -> typed fields/collections. Element -> binding/event -> registered operation. Automation -> approved inputs/trigger/steps/output. Grant -> requesting app/Surface + providing app/Surface/resource + allowed operation. Definitions/data have distinct revisions. Current activation uses existing transactional validation/version patterns, expanded beyond one workspace artifact.

The central registry is the chosen local PoC store; apps remain logical owners of their data. No UI definitions are copied between apps as a sharing mechanism. Subscribe to resource identity/revisions, authorize owner reads, update recipient data, then render the recipient's own Surface.

## Agent and model boundary

The shared agent runtime can inspect and manipulate authorized Surface/data/action records. Meta model selection/key are engine-owned; all apps use the selected profile. App payloads, generated projects, registry discovery and model context exclude key values. Secrets use session memory first or an established native credential facility when persistent storage is added. Model output is validated; failed/stale proposals cannot mutate live state.

Dynamic behavior comes from typed events and bounded registered operations, optionally a Muse structured transformation. No arbitrary generated Node/Rust modules, unrestricted network or universal expression engine is required for the PoC. A general app can still be composed from useful primitive data operations, collections, inputs and outputs.

## Native project delivery

A project contains an app manifest, pinned Mallea runtime/SDK artifact, Tauri shell/template, app-owned metadata and normal build scripts/locks. It builds without an absolute link into the creator's checkout. The initial default definition is empty except framework Shape. Subsequent model/schema/Surface revisions load from Core without native recompilation. The E001 format copies the built frontend and native sources/lock into each project, with its own pinned Tauri CLI dependency and private local host configuration. It compiled outside the original checkout.

Core can initially be launched explicitly from source. Automatic sidecar installation/engine startup is delivery work only after the source path works; no bundled runtime/installer claim is made prematurely. Closing the dashboard is distinct from shutting down Core.

## Current verification boundary

E001 Windows evidence: 39 sequential tests, TypeScript, independent native Fieldnote/Parcel with two-way manual exchange, a separately compiled portable blank app, live notes authoring and persisted state. The dashboard, session Surface expiry, Surface-level grants, automatic subscriptions and semantic Automations remain to be built and verified. Browser product support and Observer are parked; older guides are archived historical evidence.
