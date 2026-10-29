# Slice 003 acceptance evidence

Date: 2026-10-28. Scope: M1 first working Surface, not full Mallea/demo completion. Active plan v013. Automated and agent-operated results below are not user confirmation. Subsequently the user confirmed the demo flow and moving panel side; that feedback is recorded separately in STATUS.md.

## Baseline and reuse

- Fresh start: 21 tests and TypeScript checks passed. Read status, goal, active plan, foundation/demo and slice definition, then inspected renderer, builder, store, registry and gateway.
- Stopped only identified Mallea previews before installing Fabric.js 7.4.0 (MIT). Canvas adapter uses public APIs; no object model leaks into the Mallea contract. Browser/Tauri need no native node-canvas setup. Existing MCP, SQLite, author loop, version store and connections were extended.
- Studio mode uses .mallea/studio.sqlite, leaving legacy workspace data intact. Old frontend routes use ?legacy. No credentials changed.

## Actual model/browser/native walkthrough

1. Fieldnote browser preview rendered the original vector artwork with editable text and revision note. Corrected Fabric 7 origin defaults through public originX/originY options. Edited text to KEEP EXPLORING, saved image/note revision.
2. Real development generation authored a split canvas/control Surface on attempt 1. Preview text changed to PREVIEW ONLY while live text remained KEEP EXPLORING. Approved access and installed v1.0.0; live data retained. Generated color control changed the actual annotation; PNG export reflected it.
3. Parcel, with a distinct visual shell, initially showed older artwork. Approved saved-design read, fetched image/note through official MCP gateway and authenticated owner WebSocket. Source revision updated without transferring UI components.
4. Kept an unsaved note while requesting controls above canvas with Creative controls heading. Development generation passed attempt 1; installation v1.0.1 moved controls and preserved that unsaved note. Saved afterward.
5. Actual Windows release rendered the corrected canvas and installed controls. The native WebView color popup was awkward for automation; an editable hex field now accompanies the normal picker. In native Fieldnote, setting #64c6bf changed the canvas and Save revision exported revision 6 plus the note Saved from the actual Windows desktop. Parcel fetched that saved native revision and displayed the teal artwork/note.
6. A third development generation in Parcel passed attempt 1 and installed its own v1.0.0, placing image/note side by side. Native package stayed separate.
7. Stopped/restarted the same studio service. Native/browser connections recovered automatically; packages, read access, saved image/note and published asset survived. Disable restored Fieldnote's starting layout, Enable restored v1.0.1 without losing data. Unchanged refresh left asset revision unchanged.
8. Closed all Fieldnote instances. Parcel refresh reported Source app is offline and preserved its published image. Reopening the actual native app recovered installed layout and saved data.
9. From the actual final native release, requested compact split workspace with Studio tools, generated on attempt 1, previewed, approved and installed v1.0.2. This was a real native builder interaction, not merely a browser screenshot. Native canvas/control composition changed and retained revision 6 data. Verified color action dispatch, dragged annotation and saved revision 7. No extra model call was needed to use the installed control.

Native final evidence: .mallea/screenshots/slice003-fieldnote-native.png. Web evidence: .mallea/screenshots/slice003-parcel.png. Both are ignored local artifacts. Web screenshot shows the successfully transferred native revision 6; final native screenshot shows later revision 7. A later optional web-refresh attempt encountered browser-control availability failure; earlier actual native-to-web acceptance and automated routing checks already passed. Do not describe that optional attempt as a successful revision-7 web read.

## Model accounting and evidence boundary

- Development browser initial: 4,114 tokens, reported cost 0.0084819, attempt 1.
- Development browser refinement: 4,288 tokens, reported cost 0.0085970, attempt 1.
- Development native refinement: 4,290 tokens, reported cost 0.0082999, attempt 1.
- Known subtotal for those three: 12,692 tokens, reported cost 0.0253788. The Parcel generation also passed attempt 1, but its in-memory usage was not retained before the service restart. This subtotal is not the total slice spend; do not invent the missing usage or rerun a paid request to recover it.
- Direct Meta muse-spark-1.3 service-level milestone: initial 4,266 tokens in 6,094 ms; refinement 4,079 tokens in 3,767 ms; both attempt 1. Total 8,345 tokens, monetary usage not supplied. No production fallback or repair requests occurred.
- That Meta check used scripts/verify-surface.mjs and an isolated in-memory service. It verified valid working-action definitions, install/refinement and retained data. It is separate from the actual native UI authoring walkthrough, which used configured development inference. Do not call it a Meta/native recording or proof of all natural-language semantics.

## Final checks and handoff

- 25 tests passed, including legacy regressions, Surface authority/binding/markup constraints, unrelated weather-schema action dispatch, app-scoped stale install rejection, persisted disabled state and saved image/note, real MCP owner reads, denied/wrong-owner/offline calls, duplicate/stale saves and unchanged refresh.
- TypeScript checking, both Vite builds and final Windows native release build passed. Vite reports the approximately 619 kB app chunk; it is a known optimization opportunity, not a failed build. No macOS/Linux run claimed.
- README updated with experience-first studio commands, Windows/Unix setup/build/run/stop, manual acceptance, configuration, isolated reset and bounded model verification. Legacy walkthrough retained separately. SDK limits and rendering boundary documented in SURFACE_SDK.md. v013 preserves every v012 byte outside one localized insertion.
- Current source needs an explicit configured inference endpoint for fresh authoring. Starting apps run without a key; labelled real-artifact replay/launcher/native packaging polish are later delivery work. No Observer, feedback return, publishing Automation, generalized uploads, schema upgrades, background scheduler or full agent management is claimed.
- One active installed workspace Surface per app. Domain adapters remain specific to these small apps; shared validated composition/action dispatch uses registrations. Unsaved drafts survive compatible install/refinement in the open runtime but not close/reload; save before reopening. Initial handoff awaited user feedback; subsequent user confirmation covers the demo flow and changing panel side, not every check recorded here.

## User check

Follow README See it running using --studio, preferably a new MALLEA_DB filename for a clean authoring walkthrough. Run actual native Fieldnote and Parcel. Edit note/title, build/preview/install a color/workspace Surface, change color, refine placement, save. Approve read and refresh Parcel: image/note/source revision match saved data. Preview edits must not affect live data; an unsaved edit must not publish. Reload/reopen keeps installed Surface and saved data. Disable/enable restores each presentation. Revoke or close source prevents further reads and leaves the already-published asset intact. Record the user's observed results separately from this evidence.
