# Malleable-core acceptance

Windows reference, October 30, 2026. Advances E2 under plan v022. The user confirmed the four Surface-modification handoff flows worked: Fieldnote scoped typography, Parcel scoped styling, global addition of a separate notes Surface and notes input/Add/list behavior. Optional tests below are not all independently user-confirmed; E001 feedback remains separate. See STATUS.md for the acceptance record.

## Evidence and scope

- Fieldnote, Parcel and the existing notes app migrated to the same independent Surface/model store and one native LiveApp renderer. Existing saved artwork/reviews, local notes, grants and compatible active styling were retained. Pre-migration definitions/local state are recoverable from live_backups and the stopped-service database backup.
- Shared typed inputs/collections, item templates and registered events/actions are exercised through Core. Tests cover scope denial, forged/stale events, type rejection, concurrent saved values during authoring, schema extension, presentation removal and restart. Actual socket tests cover session expiry and reconnect grace without deleting data.
- A real development model built two independent notes Surfaces from blank; a declared input and append operation worked. A later scoped typography edit retained the other Surface and saved list data. No scripted model output was used.
- In the native Fieldnote window, right-click on the versions list opened the correct Surface/element context; live generation, preview, approval and installation changed its font size. Native inspection found a column-layout inheritance bug and an overly large scoped preview; both were corrected before the final rebuild.
- Migrated Parcel received a real scoped bold/size change to the designer's note. The existing notes app gained model-authored input/list Surfaces while retaining the original Ideas note. Native input and Add button produced a visible saved item. A misleading literal empty-state label was removed via another scoped model edit.
- A real direct-Meta isolated check created the two-Surface app on attempt 1, then refined it on attempt 2 after correcting an unknown target ID. Three calls used 10,470 total tokens. Approved install, working collection behavior, retained data and unchanged unrelated Surfaces passed. This is service evidence, distinct from native interaction.
- The official Tauri dialog plugin supplies the native export picker. The separately generated project was refreshed using sync-project, backed up privately, and compiled outside the checkout using the shared compiler cache. It retains its own manifest/configuration and standalone executable; cache reuse is not a clean-machine build claim.

Final evidence: 45/45 sequential tests, TypeScript and both native builds passed. Native restarts retained the installed edits and notes. Native PNG export matched the saved image byte-for-byte; native JSON export reached the explicitly selected local destination and parsed correctly. Actual owner routing in both directions retained the edited definitions. See STATUS.md for limits and platform evidence.

Registered canvas text/position changes also pass through typed Core dispatch, with declared bounds and events visible in the common inventory. A real native drag exercised that path and changed the unsaved-state indicator; it was discarded afterward so the original saved artwork remains.

## User test sequence

Run/build/source upgrade commands are in root README, including separate generated-project upgrade steps. Other platforms still require actual native tests.

1. Open Fieldnote. Right-click saved-version text, choose Modify this surface, request “Set the saved versions text size to 16; keep its bindings and layout.” Expect the correct Surface/element scope. Build, preview, approve and install; expect only that Surface to change.
2. In Parcel, right-click the designer's note and request a font/color change. Expect the same editor and behavior, with Parcel's own Surface context. Saved image/revision/review data must remain.
3. Use global Shape in either app: “Add an independent Follow-ups Surface with a multiline notes field. Preserve existing Surfaces and data.” Expect a new model/Surface and working input. Edit it and wait for Local changes saved.
4. In the notes app, enter a new note and click Add note. Expect it in the saved list. The original Ideas note must remain. Item removal is a declared collection action; test with disposable notes.
5. Use global Shape to move/rearrange a Surface. Expect app-wide scope and retained data. Use scoped Shape on one Surface and request a change to another; Core must reject the out-of-scope proposal or explain the need for global Shape.
6. Add an explicitly temporary Surface. Close the app, wait more than three seconds, then reopen. Expect that Surface to be gone, while persistent Surfaces and model data remain. A brief reconnect within the grace period should not discard it.
7. Right-click a Surface and export text/JSON; select a new local file. In Parcel, right-click the saved image and export PNG. Expect a native save dialog, correct output and a safe cancel path.
8. Save a new Fieldnote revision and refresh it in Parcel. Post feedback in Parcel and fetch it in Fieldnote. Expect the existing two-way behavior with its current grants. Reopen apps/Core against the same database; expect retained Surfaces, notes and artwork/review state.

## Remaining work

E3 dashboard/settings/catalogue/graphical creator; E4 Surface-sharing grants, auto-sync and executable Automations; E5 fresh setup/platform validation/demo recording. Web delivery and Observer remain parked. Model authoring can still need bounded repair and can produce semantically imperfect choices; schema validation is not proof every arbitrary request was understood. Supported vocabulary and safety/preview limits are listed in SURFACE_API_004.md.
