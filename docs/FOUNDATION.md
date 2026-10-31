# Mallea foundation

Active plan: [PROJECT_PLAN.v023.md](PROJECT_PLAN.v023.md). Accepted desktop-engine vision, October 30, 2026. Earlier browser/Observer-first plans are historical.

Mallea is a framework for software that users can reshape at the point of use, with Meta Muse assistance in every app. It also gives apps a shared way to discover each other and exchange permitted data/state/actions on one machine. These are the two inseparable foundations.

The product consists of a local Core engine, independently running Tauri desktop apps and a dashboard. React is the Surface renderer. Core supplies registry, typed data, agent tools, permissions, persistence, MCP routing and Automation execution. The dashboard inspects apps, configures the common Meta model/key, displays an illustrative catalogue and scaffolds projects; it does not embed app interfaces.

Every app-owned visual element and its events, bindings and actions belongs to the Surface API. A Surface has identity, owner, schema references, placement, version and persistent/session lifetime. Built-in and user-authored Surfaces use the same mechanism. Framework panels are system-owned Surfaces; OS window chrome and primitive internals remain native implementation details. Full access to the authorized API does not mean arbitrary host code or access to model credentials.

Definitions, schemas and bindings live in a local registry and change transactionally while apps run. Revisions notify the renderer; edits do not require app reload or native rebuild. Persistent Surfaces/data survive restart. Session-only Surfaces are explicitly ephemeral. Presentation removal and data deletion are separate operations.

Each app supplies an app-specific MCP interface, which the local engine may host as an app-scoped endpoint and route to the owner. Discovery shares metadata automatically. App/Surface grants authorize data/actions; approved subscriptions may then auto-sync. Revocation stops new operations. Communication transfers typed data/state/events, never another app's running view tree.

An Automation is an executable, permissioned event-to-operation definition with optional Muse reasoning and an output binding. It may run deterministically after authoring. Its trigger/input/output/permissions and latest outcome are inspectable. Live brief-to-concepts is the recommended semantic demonstration; date-to-slots explains deterministic reactivity.

A newly scaffolded project compiles to a real blank Tauri app with only Shape access. The user builds it incrementally using Surfaces and models. Blank creation and app-specific schema/action composition are essential proof of a framework rather than two fixed demos.

Web product support and Observer are parked. Remote P2P/encrypted routing, marketplace distribution, OS implementation and RL training are future directions. The original designer apps and existing targeted-edit tests are reusable evidence, not a limit on the new framework model or proof the new vision already works.

Implementation scope and status: [FOUNDATION_PLAN.md](FOUNDATION_PLAN.md), [STATUS.md](STATUS.md). Demo and Automation choices: [DEMO_PLAN.md](DEMO_PLAN.md), [AUTOMATION_IDEAS.md](AUTOMATION_IDEAS.md).
