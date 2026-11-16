# C002: whole-app collection schema evolution

November 16 user screenshot: Shape shows Edit the whole app but rejects adding tags to existing notes as a scoped model change. Advances E2/E3 incremental app authoring before A2. Work proceeds directly on main under the user's standing direction.

## Findings and numbered units

The UI/API pass app intent correctly. Model instructions did not explicitly describe whole-app allowances, and extendModel could only add top-level fields, not item fields inside an existing collection. No live-provider claim is made about the exact reasoning that produced the screenshot message.

| Unit | Scope and acceptance |
| --- | --- |
| C2.1 | Add extendCollection with explicit whole-app policy, an existing model/collection target and 1–24 new scalar fields, at most 24 item fields total. Existing names/types cannot be overwritten. Validate all defaults; fill declared initial rows and existing runtime rows on a private copy. Independent-add and Surface-scoped requests remain rejected. |
| C2.2 | Replay the trusted operation at approved install against the latest values, preserving notes edited/added while previewing. Fill only new field defaults. Reject tampered/stale drafts and retain explicit approval. Existing Add actions can omit newly added fields; a wholly blank submitted item remains rejected, while individual blank fields are allowed. Model/schema/data additions survive restart and presentation Undo. |
| C2.3 | Give Tools and Basic JSON precise mode-specific guidance, expose the authoritative schema/overview, test both modes through HTTP with scripted inference, and run focused/full checks and frontend/type builds. Review README and record user steps/limits. |

Example operation: `{ "op": "extendCollection", "id": "notes", "field": "items", "fields": { "tags": { "type": "text", "initial": "" } } }`. The author must compose ordinary bound editor fields and collection actions for entering/updating tags; this operation alone changes only the collection schema/defaults.

## Exclusions and limits

No arbitrary type changes, deletion/renaming of item fields, nested collections, user-data patching, A2 progressive previews, live paid inference or model-switching fallback. Scoped access is not widened automatically. Existing persisted apps are changed only when their user approves a proposal. The SDK revision remains 0.4: this is an additive authoring operation served by Core; host capability negotiation remains A7.

## User test

1. Close app windows and stop the old Core with Ctrl+C in its source terminal. From the repository root, run `node scripts/mallea.mjs run` in Windows PowerShell or Linux/macOS Bash/Zsh, then reopen the notes app. Existing renderer controls support the change; no scaffold rewrite is needed. Configure the single Core model again if it was entered only for the previous session.
2. Open Shape, select Edit the whole app and repeat the screenshot request: add a tags text box for each note. Expect a normal proposal, not a request to switch into the mode already selected. The chosen model still determines the proposed editing layout and may ask for clarification.
3. Preview and approve. Existing notes must retain their titles/body; the new tags start empty. Enter tags, save a note and add another note. Verify the inputs/actions supplied by the proposal actually save them.
4. Restart Core and reopen the app. Notes/tags should persist. Undo last change restores prior presentation while retaining model fields/data.
5. Optional boundary check: request the same shared schema change from Modify this surface. Expect a refusal or explicit whole-app alternative; it must not silently widen access.

The automated regression uses synthetic tool/JSON responses and real Core/HTTP/storage/events; it does not establish the user's provider quality or native acceptance. macOS verification stays deferred. Fresh results and user feedback are separate in STATUS.md.
