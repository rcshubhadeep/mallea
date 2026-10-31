# Point-of-use authoring and Automation

Accepted interaction model, October 30, 2026. Follow PROJECT_PLAN.v023.md. This specifies planned behavior; implementation is not claimed. Use the same shared builder/model tools throughout.

The framework supplies this menu and these panels through system-owned Surface UI, once for all apps. Apps declare element ownership, data and event capabilities; they do not implement bespoke agent menus. Invocation/selection context is transient UI state, separate from persistent Surface definitions.

## Two ways into Shape

**App-wide Shape Your App** remains available at any time. It supplies the running app's permitted Surface inventory, models, bindings, events/actions and relationships. It supports changes across that app, including adding and arranging Surfaces. It does not grant access to unrelated apps or raw credentials.

**Modify this surface** is available from the framework context menu on any registered app element. It opens Shape focused on the element's owning Surface. Context contains app/Surface/element IDs, current definition/version, relevant model schemas/bindings and declared events/actions. The clicked element is focus within the Surface, not a restriction to styling that one element.

Show the scope in plain language, for example Fieldnote > Inspector, with the selected item named. A scoped proposal must not silently modify other Surfaces; engine validation enforces this independently of the prompt. To broaden an edit, explicitly switch to app-wide context. Creation, preview, approval and persistence reuse the same path in both modes.

Nested visual clicks resolve to the owning registered element/Surface, rather than the nearest arbitrary HTML container. A canvas adapter can supply a public selection/subtarget when available; it does not expose arbitrary renderer internals. System-owned framework Surfaces retain their ownership/permission rules. Native OS window chrome is outside app element handling.

Keep global Shape as the discoverable/recovery route. Right-click is an additional shortcut. Equivalent keyboard/context-menu access may use the same action; ordinary copy/paste behavior should remain available where appropriate.

## Context menu: Set Automation

The menu item is enabled only when the selected element exposes a usable registered trigger. A static literal text/list with no event or observable change has the item disabled, with a reason such as This item has no event to start an Automation.

Do not classify eligibility solely by editable versus read-only. A read-only list bound to changing data may expose When this list changes and qualify. Conversely, an element containing constant data is not automatically a trigger source. Framework context-menu events and incidental DOM listeners do not make every element eligible. The registry declares the supported triggers.

Choosing Set Automation opens the common builder in Automation mode, with the source app/Surface/element already selected. It does not immediately activate a subscription or authorize sharing.

## Three simple steps

### 1. When should it run?

Offer presets in ordinary English, not event identifiers or code. Initial labels:

- When I type — supported text entry; wait until the user briefly pauses, with that behavior stated beside the option.
- When I click — a declared button/control activation.
- When I choose a value — a declared selection/date/value change.
- When I leave this field — a declared field-leave event.
- When this list changes — only for a declared observable collection.

Only show choices that the selected element supports. Native focus, change or collection events are implementation details. Additional triggers can be registered later; do not imply every possible event is already implemented. Debouncing and an in-flight guard are runtime controls, not jargon the user must learn.

The trigger and the data read are distinct records. A button click can read text in another permitted field. The clicked source is the useful default, not a hardcoded requirement that every input must come from it.

### 2. What should happen?

Specify the input and transformer in user language. Examples: Extract the main ideas with Muse; Find email addresses locally; Look up the available times for this date. The transformer can be a bounded registered local operation, shared Meta inference, or an approved app capability. A direct copy is a valid unchanged transformation.

Explain who receives input: Runs on this machine for a local operation, or This text is sent to the configured Meta model for semantic processing. This is part of the readable Automation summary and permissions. No key or secret is sent in model context or copied to an app model. Start with one transformer per Automation; a general pipeline editor is unnecessary.

### 3. Where should the result go?

Pick an element backed by a compatible writable field/collection. Group choices by app, Surface and element. Include the current app and other running apps that expose approved shared destinations. A text area can feed a text output; a concept-list result needs a compatible list model or an explicitly supported conversion. A visual static container can display output through its backing model; the Automation does not write raw HTML.

Discovery of a shared Surface is not write permission. Filter by type and grants; if unavailable targets are shown, disable them with a clear compatibility/access reason and an explicit permission-request path. A trigger event does not authorize unapproved reads or writes. Choosing another app sends data to its model; it does not send a visual component.

Choose whether output replaces the current value/list or appends supported items. Do not guess destructive replacement from an ambiguous request. The initial PoC can provide a simple explicit Replace / Add to list choice where applicable.

## Review and execution

Before activation show a concise summary, for example:

After you pause typing in Brief, send that text to Meta Muse to extract key concepts. Replace the Concepts list in this app. No other fields are read or changed.

Another example:

When you leave Notes, find email addresses on this machine. Add them to the approved Contacts list in the other app.

Persist owner/source, event preset and runtime mapping, permitted inputs, transformer, output schema, destination binding, replace/append policy, enabled state and latest outcome. Keep definitions separate from data values. Run permissions and source/destination existence are checked again at execution; pause/revocation/deletion blocks future runs. Reject stale model output rather than overwriting a newer revision.

## Required tests when implemented

Right-click two elements in different Surfaces and verify the correct owner context; global Shape still sees the permitted app inventory. A scoped proposal targeting another Surface is rejected. Static non-trigger elements disable Set Automation; declared observable read-only data can enable it. Trigger labels contain no internal event code. A button can trigger a read of another permitted field. Destination choices respect type and write grants across apps. No transformation/output runs until reviewed and enabled. Persistent definitions survive restart; declared session Surfaces follow their lifecycle. Record actual model, native and user evidence separately.
