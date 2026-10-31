# Shared live app API

Implemented by the desktop Core/host. SDK 0.4 is the canonical native app model; SDK 0.3 remains for predecessor tests and recoverable migration, not a separate Fieldnote/Parcel UI path.

## App and Surface records

Each app owns a revisioned definition with an ordered Surface collection and typed model records. A Surface has its own ID, title, version, lifetime, placement slot, width, visibility and element tree. Layout choices are columns, rows and grid; slots are header/main/footer and widths narrow/wide/auto. Stable element IDs are scoped by Surface. Repeated templates additionally receive an item index.

Core stores records in live_apps, approved proposal drafts in live_drafts, pre-migration workspace snapshots in live_backups, system-owned UI definitions in live_system_surfaces, and adapter schemas/actions/primitives in live_adapter_schemas. Existing artwork/review data and grants remain in the registered domain adapters' stores, with inspectable typed model declarations in the common inventory. Model values are separate from presentation changes and are retained when a Surface disappears. Definitions and data have separate revisions; stale writes/proposals are rejected.

The same LiveApp host, Surface renderer, model/action dispatch and authoring tools run Fieldnote, Parcel and generated apps. Domain adapters implement canvas/save/review behavior only. Recovery, context menu, builder, preview and approval controls are system-owned Surface definitions; ordinary application headers/footers are app-owned Surfaces. System records cannot be edited by app proposals. Primitive internals and native window/save-dialog chrome remain implementation boundaries.

## Supported vocabulary

- Layout: stack, row, split, grid and collapsible details.
- Content: text, image, repeated items and registered primitives.
- Controls: text input, multiline input, color, choice, checkbox, date, number and button.
- Appearance: existing named tokens and bounded color, spacing, typography and border properties. No arbitrary CSS/HTML/scripts.
- Data: text, color, boolean, number, ISO date, enum, image and bounded typed collections. New model fields may be added; changing an existing field's type requires a new field name. Values survive compatible definition changes and concurrent authoring.
- Operations: data.set, collection.append, collection.remove and collection.clear, plus registered adapter actions. Input bindings and button argument references are declarative; Core resolves and validates them against the current app/element. A repeat template reads item fields and can use item.index for a declared remove operation. Registered primitives expose properties/events/actions; canvas text and position events use the same typed Core event dispatcher, while pixel rendering/readiness remain native implementation details.

Generic bindings use models.MODEL.FIELD. Adapters expose their registered typed bindings through the same Surface API. Collection item templates use item.FIELD. Fields/models are owned by the app; cross-app writes are not supplied by these generic operations.

Registered read-only collections may additionally declare fieldSchemas with typed item fields. Registered actions may declare parameters; button args can reference those item fields. Core resolves the current item and validates argument types before returning the registered adapter action. This powers dashboard app cards without app-specific card components. The ordinary argument/value action format remains supported. Root hiddenBind conditions also remove that Surface's layout footprint.

The dashboard uses the same app/Surface registry and renderer. Its settings, project creator and concept preview are engine-owned system Surface records; only the password input and OS folder picker are primitive/native boundaries. Settings/build operations require a dashboard-only native capability, not an app-selected identity or prompt instruction. Keys never enter these records. Model selection is session-only and takes effect for subsequent jobs; running jobs finish with the configuration selected when they began. Core restart restores environment settings.

## Authoring and execution

Proposals create/extend models; add, edit, move, hide or remove Surfaces; apply targeted element changes; or change app layout. Right-click Modify this surface limits edits to that owner, with its focused element. It can add fields used by the selected Surface, but cannot rearrange or modify another Surface. Global Shape permits app-wide composition. Core enforces the scope, validates the complete resulting app, and requires approval before atomic install. App-owned Surfaces, including the canvas Surface, can be removed and re-added without deleting their data. Canvas-dependent save behavior is unavailable while its primitive is absent; framework recovery stays available.

Native hosts use authenticated app sessions. The live API exposes state, declared element events, authoring/jobs/draft/install, and export under api/live. Caller identity comes from the session, not a body-selected app ID. Only the declared input/button event executes; arbitrary operation names or bindings supplied outside the registered element are rejected. Authoring receives definitions/schema context, not current private model values. A single JSON formatting fence is accepted, with the same subsequent schema/scope/behavior checks.

Inputs persist after a short idle pause; wait for Local changes saved. A button flushes pending inputs first. Preview input changes stay in a separate copy; preview buttons do not write to the service. Installation uses current saved model values, not edited preview text or an older generation snapshot.

Persistent Surfaces survive restart. Session Surfaces are removed after the last owner disconnects with a three-second reconnect grace, or when Core restarts. Their models/data remain. Context export reads the selected Surface's bindings and offers text/JSON or an existing saved PNG through the native destination picker. The agent cannot choose an arbitrary filesystem path. The picker reuses the [official Tauri dialog plugin](https://v2.tauri.app/plugin/dialog/).

## Boundaries

Vocabulary and registered operations are intentionally small. No arbitrary native code, expressions, schema type replacement, general workflow scheduler, remote sharing, automatic subscriptions or semantic Automation. App/Surface sharing grants and full Automation setup remain later work. Trigger eligibility is derived from declarations; the context menu currently explains that Automation setup is unavailable. Existing manual two-way domain sharing remains app-level. Linux/macOS native execution is untested.
