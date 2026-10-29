# SDK 0.3: bounded live Surfaces

Slices 003/003A extend the existing builder/version store with strict declarative data and new local fields. It is not arbitrary React generation. Follow PROJECT_PLAN.v015.md. Legacy SDK 0.2 packages keep their iframe/QuickJS boundary.

## Definition

An artifact contains manifest, ui and optional state. Manifest: id, title, semantic version, sdkVersion "0.3", permissions. UI nodes: unique id, type, optional label/text/bind/action/argument/component/style/children. Validation rejects unknown keys, fields, components, actions, undeclared access, duplicate nodes/components and oversized trees. Limits: 80 nodes, depth 8, 20 children/layout, 400-character text, 100-character label.

| Node | Meaning |
| --- | --- |
| stack, split, grid | Nonempty children in vertical/two-column layouts; responsive single column |
| text | Escaped literal text or registered binding |
| image | Registered image binding; trusted data-image resource only |
| input, textarea, color | Existing app binding plus action/argument, or new declared local binding using the framework setter |
| button | Registered argument-free action |
| repeat | Registered list rendered as text items; no custom row code |
| component | One registered trusted app component reference, such as design-canvas |

Style is bounded data: background/color as six-digit hex, gap/padding as integers 0-40. No arbitrary CSS, HTML, scripts, expressions, URLs, imports, dependencies or native commands. Component implementations are trusted framework/app code. Model-provided data is validated before trusted React rendering; text is escaped, and no eval/HTML injection path exists. This reduces executable surface area; it is not a claim of a security audit.

## Registered app boundary

Contracts specify readable paths and types, read permission, allowed actions with argument/binding, and trusted components. Shared rendering and binding dispatch do not know annotation/asset field names. The Fieldnote adapter owns its canvas/draft mutations; Parcel owns the published asset. A test-only weather contract exercises the same mechanism without engine edits.

Fieldnote exposes annotation text/color, revision note, saved image/note/revision and one required design-canvas. Parcel exposes image/note/title/revision. Both also support new Surface-local data through the framework; Parcel's read-only asset contract does not prevent adding a writable local text box. The builder can add/group/reorder controls and panels. It cannot remove the required canvas, invent remote writes, scheduling or file access, or claim unimplemented feedback/publication.

## New local fields in either host

Declare optional state, for example `state:{extraNote:{type:"text",initial:""}}`, and include `surface.local.write` in manifest permissions. A new textarea uses `bind:"local.extraNote"` and no action/argument. Existing app bindings still require their registered actions and grants. This is the same facility for web and desktop, not a domain-specific notes recipe.

Up to 16 fields per Surface, text up to 2000 characters or a six-digit color value. Field names start with a lower-case letter, then letters/digits/underscore, maximum 40 characters; prototype-related names are forbidden. No arbitrary nested schema, arrays, files, generated code or cross-app state references. Text/image/button/list vocabulary remains bounded as listed above.

SQLite stores values by authenticated app and stable Surface identity, independently of domain resources. Compatible keys retain values across layout refinements, reload, disable or temporary removal. Reusing a saved key with a different type is rejected; use a new key. This is not general schema migration. Multiple panels compose into the one installed workspace definition; independent multi-package management is not implemented.

Preview uses its own initial/copy values and never calls local persistence. Installation initializes defaults only for new keys and does not import preview edits. Live local values save after a short editing pause, on blur, or via Save local changes. Wait for Local changes saved before closing/reloading. Writes verify declared fields, types/sizes, active version and expected state revision. A failure remains visible; it does not grant authority to edit app-owned data or another app.

Local means this app/Surface on the local companion. It is not browser-only storage or production account-level confidentiality. Different windows of the same local app may see its saved values. The builder receives definitions, not these saved field values by default.

The initial app model is hand-authored and labelled. Generated installed definitions come from actual configured inference, not an intent-to-template switch. Builder receives current app definition, workspace and real gateway catalogue, reuses bounded repairs (maximum 3 calls), then saves a draft. Model-assisted unsupported responses do not prove universal semantic compliance: user preview and request-specific checks still matter.

## Draft, preview and persistence

Runtime draft is local to the editing app instance. Save revision exports the 640 x 420 canvas PNG plus note and annotation fields to the local SQLite companion. Unsaved draft is preserved through compatible Surface install/refinement but not recovered after closing/reloading. Keep one editing instance in the PoC.

Preview gets an independent data copy and separately mounted trusted canvas. It has no save/remote mutation bridge. Installation approves declared access, checks the draft's active-version base, and atomically changes the existing per-app package pointer. A failed/stale proposal leaves the old Surface active. Disable preserves the installed version while reverting presentation to the starting model. Base-app schema upgrades and migrated-state rollback are deferred.

## Saved-design exchange

Parcel explicitly grants design.saved.read for the linked Fieldnote resource. Manual refresh invokes registered read_saved_design through the existing official MCP gateway; it routes an owner request over the authenticated outbound WebSocket. Owner-offline and missing-access conditions fail. Shared owner dispatch consumes the capability registration; app adapters retain the seeded design relationship. This two-app domain is intentionally small, not arbitrary cross-app registration from untrusted websites.

Requests use the existing origin/host/session/connection-ticket boundary. Images are limited to approximately 1.5 million data-URL characters (request/socket limit 1.6 million bytes); saves check PNG signature and dimensions. These checks are not full PNG validation. Source revision and expected saved revision prevent stale publication/saves; last 50 operation fingerprints deduplicate recent saves. This is bounded local deduplication, not exactly-once execution across distributed systems.

No visual component tree crosses between apps. The saved PNG is an image resource; Parcel renders it with its own local Surface. Revoking source read access stops future reads; already-published local copies remain. Hash/version receipts and installed publishing Automation are Slice 005, feedback return and Observer are Slice 004.

## Reproduction

Use root README for platform prerequisites, --studio startup, native build and UI walkthrough. All deterministic tests: Windows PowerShell npm.cmd --script-shell=cmd.exe test; Bash/Zsh npm test. Type/build: Windows npm.cmd --script-shell=cmd.exe run build; Bash/Zsh npm run build. No test suite inference calls.

The optional scripts/verify-surface.mjs uses an isolated in-memory service and two real generation jobs (initial + refinement, each maximum three attempts). Root README documents explicit development/production commands and expected output. It checks declared action presence and retained data; it does not substitute for actual native interaction or verify every natural-language layout requirement.
