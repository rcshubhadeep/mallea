# SDK 0.3: bounded live Surfaces

Implementation reference for the predecessor runtime. Current product direction and unimplemented engine contracts are governed by PROJECT_PLAN.v019.md; this reference does not establish their acceptance.

Slices 003/003A/003C-A extend the existing builder/version store with strict declarative data, local fields and Surface-native starting apps. It is not arbitrary React generation. Follow PROJECT_PLAN.v017.md. Legacy SDK 0.2 packages keep their iframe/QuickJS boundary.

## Definition

An artifact contains manifest, ui and optional state. Manifest: id, title, semantic version, sdkVersion "0.3", permissions. UI nodes: unique id, type, optional label/text/bind/action/argument/component/style/children. Validation rejects unknown keys, fields, components, actions, undeclared access, duplicate nodes/components and oversized trees. Limits: 80 nodes, depth 8, 20 children/layout, 400-character text, 100-character label.

| Node | Meaning |
| --- | --- |
| stack, split, grid | Nonempty children in vertical/two-column layouts; responsive single column |
| row, details | Wrapping horizontal group or native collapsible group; nonempty children |
| text | Escaped literal text or registered binding |
| image | Registered image binding; trusted data-image resource only |
| input, textarea, color | Existing app binding plus action/argument, or new declared local binding using the framework setter |
| choice | 1-12 unique options {label,value}; bound like an input; local text/color or registered field/action |
| button | Registered argument-free action, or declared argument plus validated literal value |
| repeat | Registered list rendered as text items; no custom row code |
| component | One registered trusted app component reference, such as design-canvas |

Style is bounded data: background/color/borderColor as six-digit hex; gap/padding integers 0-40; fontWeight normal/bold or integer 100-900; fontSize 10-48 px; fontStyle normal/italic; textAlign left/center/right; textDecoration none/underline/line-through; lineHeight 1-2.5; borderRadius 0-32 and borderWidth 0-4. Typography on repeat applies to actual list items; input typography also reaches the text control. Font family, arbitrary CSS, HTML, scripts, expressions, URLs, imports, dependencies and native commands remain unsupported. Canvas internals are trusted app code controlled by registered actions. Model data is validated before React rendering and text is escaped; this is not a security-audit claim.

## Targeted app-model edits

New Surface authoring prefers a proposal `{changes:[operation],title?,state?,permissions?}`. At most 20 operations: set(id,props), insert(parentId,index,node), move(id,parentId,index), remove(id). Indices are zero-based; move insertion uses the destination after detaching the source. Target IDs come from the visible current app model. set updates only named node properties and merges style fields; it cannot assign id/children. It is not a property-path interpreter. Root removal, moves into descendants, invalid layouts, unknown targets, missing required components and invalid final bindings/styles/actions are rejected.

Edits operate on a copy. Only a fully validated artifact enters the existing draft/preview/install pipeline; failed operations do not mutate the original. All unrelated nodes remain as-is. Added state merges named fields without changing existing key types; permissions are additive and still validated/approved. Removing a node does not delete its stored local values. Stored/imported full SDK 0.3 artifacts remain compatible; new Surface inference jobs require targeted proposals and reject rewritten apps through the bounded repair path. Legacy SDK 0.2 authoring is unchanged. No prompt-keyword recipe selects operations. Model proposals can still misunderstand a request; semantic checks and user preview remain necessary.

Installed versions persist the resolved full model using existing SQLite/version activation and stale-version checks. Proposed change summaries appear before preview approval. There is no new package manager or unbounded patch engine. Per-contribution selection/management, undo UI and blank-window app authoring remain future work.

Optional appearance tokens: workspace, sidebar, card, toolbar, title, muted, eyebrow, badge, primary. They select trusted CSS presentation, including a responsive three-column workspace, not arbitrary classes. disabledBind references a permitted registered boolean. Choice options/literal button arguments honor registered action.values and color types. A limited-choice control does not redefine domain authorization or global data policy.

## Built-in apps are Surfaces

studio-surfaces.mjs authors both starting interfaces as ordinary SDK 0.3 node data. They pass validateSurface at module load and render through the same Surface component/action dispatcher used for generated models. Brief/collection, canvas/image stage, inspector, operational buttons and review forms are declared there; there is no parallel hardcoded app workspace tree. StudioApp orchestrates app adapters/service calls, ephemeral draft state, connections and the protected framework header/builder. Fabric canvas internals remain a trusted registered component, not generated editable code.

Fresh apps have no generated package installed. Show built-in app reversibly deactivates presentation of an existing customization; it retains the package and app-local values. Install reactivates the new accepted version. The builder receives the visible initial model even when an older customization is inactive. Targeted multi-contribution editing/removal and blank-window authoring remain future work; current activation versions one composed app workspace.

## Registered app boundary

Contracts specify readable paths and types, read permission, allowed actions with argument/binding, and trusted components. Shared rendering and binding dispatch do not know annotation/asset field names. The Fieldnote adapter owns its canvas/draft mutations; Parcel owns the published asset. A test-only weather contract exercises the same mechanism without engine edits.

Fieldnote exposes annotation text/color/position, revision note, saved image/note/revision summaries, permitted feedback cache and one required design-canvas. Parcel exposes image/note/title/revisions plus app-owned review status/comment draft and posting. Both support new Surface-local data. Registered host actions perform save, grant toggle and explicit refresh; preview has no service-write/export/grant bridge. The builder cannot remove the required canvas, invent remote writes, scheduling or file access, or claim unimplemented automatic publication.

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
