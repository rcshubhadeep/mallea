# E002: malleable application core

State: defined, not started. Milestone E2. Depends on E001 native identity/registry and blank-host proof. Read active plan and verify the then-current baseline before implementation; current predecessor tests are not acceptance of this slice.

## Work units

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Independent app/Surface/model/element records, placement/version/lifetime and atomic registry updates | An app owns multiple discoverable Surfaces and typed models; edits do not require app refresh. Existing data is preserved or recoverably migrated. A blank app can register its own schema, not only use Fieldnote fields. |
| W2 | Generic data operations, typed collections/item templates, input events and bound action arguments; ordinary UI properties | Compose text input, button, list and a working add-item action without app-name/prompt-specific code. Dynamic list items expose their own registered binding/action context. Model/API denies invalid types or unknown operations. |
| W3 | Shared agent tools plus right-click Modify this surface and global Shape; preview, scope validation and targeted updates | Right-click two elements resolves the correct owner/focus. Scoped edit cannot change another Surface; global editing can compose the permitted app. Add/edit/move/remove retains unrelated layout, bindings and values. No opaque whole-app renderer shortcut. |
| W4 | Persistent/session Surface lifecycle and safe presentation removal; minimal approved export | Persistent definitions/data survive restart. Explicit session Surface does not reappear after its session ends; reconnect grace handles brief disconnects. Removing UI does not silently delete shared data. Approved text/JSON/image export uses a trusted destination picker, not arbitrary generated file writes. |
| W5 | Real incremental blank-app composition and actual native regression; docs/README/user handoff | Starting from only Shape, build a small useful two-Surface notes/list app using new models and operations. Verify working behavior, targeted appearance/layout changes and restart. Record fresh model evidence and distinguish deterministic execution from authoring. |

## User acceptance target

Create a small app from the blank host, add two independent Surfaces, enter/save data, right-click an element to edit only its Surface, use global Shape to rearrange the app, then reopen. Check session Surface removal separately. At handoff provide exact implemented commands/prompts/expected results in README. Do not claim an empty window plus metadata proves incremental app creation.

## Exclusions

No polished dashboard/catalogue/creator UI, Surface-sharing grant UI, automatic subscriptions, semantic Automation or Observer. Framework builder/context UI must itself use system-owned Surface primitives. Introduce only needed schema/UI/operation vocabulary; no universal expression language, arbitrary generated native code or new plugin/workflow engine. Keep future Set Automation eligibility driven by declared trigger metadata; its full flow belongs to E004.

Completion reports E2 acceptance and remaining work; E3-E5 remain incomplete. README review is mandatory. Re-read baseline/status/goal before E003.
