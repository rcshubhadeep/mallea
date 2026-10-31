# Engine foundation: implementation guide

Follow PROJECT_PLAN.v023.md. This is the target architecture; STATUS.md alone records completion.

## Keep and change

| Area | Reuse | Required change |
| --- | --- | --- |
| Desktop host | Existing working Tauri shell/build and React renderer | Generic app identity/manifest startup, native Parcel and dashboard roles; no hardcoded scratchpad-only entry |
| App model | SDK 0.3 nodes, bindings, styles and targeted edits | Separately identified Surfaces, app-defined models, event/action registrations and declared lifetime |
| Persistence | SQLite, versions, atomic activation and local field storage | Central app/Surface/model registry, durable links/subscriptions/Automation records; clear session cleanup |
| Agent service | Generic inference adapter and bounded author/repair/preview flow | Shared Meta-only model catalogue/settings and full registered Surface/model/action tools for blank apps |
| Communication | Official MCP SDK, registry and owner sockets | App-specific MCP endpoints/discovery, app/Surface-scoped grants, approved automatic subscriptions |
| App behavior | Fabric adapter, saved revisions and review/feedback | Register domain adapters behind the same Surface/data API; no separate application UI path |
| Project creation | Tauri CLI/toolchain | Portable template/runtime artifact, folder picker, safe scaffold/build/launch from dashboard |

## Concrete ownership boundaries

Core is the evolution of the current services/workspace service, not a new fleet. It owns one configured local database and API key handling. Local tables namespace app IDs, Surface IDs, model IDs, versions, grant tuples, Automation definitions and current state. Existing images can remain app resources. Data revisions and definition revisions are distinct.

The shared native host loads an app manifest/identity and the engine-provided model. A trusted registry maps primitive/operation names to adapters. Domain adapters may export/save an image or post review text; generated definitions cannot import arbitrary modules or call arbitrary native commands. Model context lists available schemas/actions/events, never secrets.

Contextual entry points are framework supplied: right-click an element to Modify this surface or, if a declared trigger exists, Set Automation. The same Shape panel receives the owning Surface and element focus; app-wide Shape retains the running app inventory. Validate scope in the engine. Automation setup uses three plain-English steps: when, what happens, where the result goes. Preset triggers come from capability metadata; destination choices come from compatible writable bindings and grants. See CONTEXTUAL_AUTHORING.md; this is planned work for E002/E004, not current functionality.

Use one Surface API for ordinary apps, dashboard and framework UI. Builder/approval/settings are system-owned Surfaces with appropriate rights. Keep a recovery action available if customization hides app navigation. Do not solve ordinary editing by placing uneditable application subtrees in a trusted component.

MCP facade implementation: one distinct app-scoped server endpoint can be hosted by Core with the official SDK. It advertises that app's declarations and routes approved resource/tool calls to its current owner. Do not start a redundant HTTP daemon per app, and do not equate a global tools catalogue with per-app access boundaries.

A subscription is explicit configuration linking a permitted source model/resource to a destination Surface/model. Revision events trigger authorized reads/updates, with expected revisions, operation IDs and deduplication. A revoked grant blocks the next run. Existing copied output can remain visibly stale; it is not remotely erased. Direct UI transfer remains excluded.

## Blank-app data and behavior

Surface coverage is orthogonal: containers/layout/placement; text/media; typed inputs including boolean/enum/date; collection item templates; ordinary appearance/visibility; events and typed operation arguments; data bindings and lifetime. Dynamic dashboard app cards must use collection templates with scoped item bindings/actions, not manually coded cards for known app names. Existing repeat renders text only, so this is a real required extension. Bindings are structured field/item references, not executable expressions. Use the same mechanism for a user-created list app.

Existing app-local text/color fields are insufficient for this target. Add only the generic typed models/collections and operations needed to compose the demo app: create/inspect a model, field binding, data.set, collection append/remove, declared input events and approved resource reads/writes. Simple date/enum/image primitives are added when used. Avoid a general expression language or visual graph editor.

Treat data portability as a registered operation too: export approved text/JSON or an existing image resource through a trusted native save action. The model chooses a supported format/resource; the user/native picker chooses the destination. No generated arbitrary filesystem writes or universal document-format project. Do not claim export before that operation is implemented.

Surface lifetime is explicit: persistent definitions/data survive app restarts; session definitions are discarded when the runtime session ends, including a bounded crash/reconnect grace. Do not erase persistent model data merely because a view disappears. Registry ownership and model references determine retention.

Automation records reuse these same inputs/events/operations. Runtime supports one explicit run path first, then bounded data-change/app-ready triggers. Add a validated Muse-to-structured-output step for the live brief or review checklist. One in-flight request per Automation, idle gate, output cap and stale-source guard prevent per-keystroke generation or older output overwriting newer text. Pause/disable and last outcome must work.

## Shared model configuration

The trusted engine owns one active Meta profile used by every app. The dashboard configures model/key and exposes readiness; apps receive no credential values. Only registered Meta model identities can be selected. Keep profile selection explicit and development/demo budgets separate. Do not silently fall back to production or permit arbitrary non-Meta models through a free-form label.

Session-only key storage is acceptable first. Persist credentials only through an established native credential facility, never plaintext in shared registry records or generated projects. Existing ignored environment configuration remains a developer bootstrap until dashboard settings work; no credential migration is performed in the planning rebase.

## Project portability and native startup

The creator writes a new directory selected by the user and refuses collisions. Package a pinned shared runtime/SDK with the scaffold so it builds without referencing the original developer checkout's absolute location. The exact bundle/template format is chosen by the early compile spike. Native compilation creates the shell; subsequent app composition is live engine data and does not recompile Rust.

Reuse one host implementation with manifest-selected identity for the two existing apps; create separate native app instances/windows that register independently. A multiwindow proof is useful, but the deliverable also needs a real standalone scaffold that compiles/launches. Closing dashboard details must not close apps. Central engine must remain running independently of dashboard navigation.

## Work boundaries and deferred scope

Do not pre-create new packages/folder layers unless a work unit uses them. Existing apps/desktop, packages/runtime, packages/sdk and services/workspace are practical starting points. Park browser delivery without deleting useful regression tests or unrelated user work. Move files only when it makes a concrete boundary clearer.

No new OS, remote pairing/encryption, production multi-user identity, marketplace backend, billing, arbitrary code interpreter, general scheduler or Observer. Catalogue content must have local original artwork and explicit concept labels. Dashboard statistics come from real registry state; no invented CPU/memory values.

Acceptance comes from two native apps plus a separately scaffolded blank app, real model-authored changes and semantic Automation, Surface-scoped grant denial/revocation, hot updates, restart persistence and reproducible source-run instructions. Strong predecessor tests do not substitute for those checks.
