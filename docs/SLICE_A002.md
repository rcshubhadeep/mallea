# A002: progressive validated draft previews

Second A2UI-inspired Core slice in CORE_ECOSYSTEM_ROADMAP.md. Authorized programme continues November 16 after the user accepted C002 whole-app tags. Work proceeds directly on main. Advances E2 authoring; current plan v030 is unchanged.

## Numbered units

| Unit | Scope | Acceptance |
| --- | --- | --- |
| A2.1 | Core snapshot contract | After each successful, complete apply_draft tool operation, expose one latest validated preview with monotonic sequence and base revision through the existing app-scoped job polling path. Keep no history; cap each snapshot at 256 KiB UTF-8 JSON and retain existing turn/tool/operation limits. No token streaming. Snapshots are in memory, use schema defaults rather than live model values, and are not installable drafts. Oversized drafts continue without progressive snapshots. |
| A2.2 | Isolated renderer preview | Show the latest available snapshot through the existing preview renderer while building. Distinguish Building preview from the completed proposal, keep approval/install unavailable until ready, and discard isolated preview interaction state on each new snapshot. Preserve scope filtering. Reject old job, old sequence, delayed final-fetch and stale-definition results. Pending questions retain their existing protected panel. |
| A2.3 | Lifecycle and handoff | Cancel, failure, unsupported, expiry, last-owner disconnect, stale definition and close clear progressive snapshots; late inference cannot restore them. Ready creates only the normal final draft with existing approval/replay checks. Regression covers sequential snapshots, invalid operations, size bounds, access isolation, cancellation/staleness/restart and final install. Run full tests/type/frontend builds, renderer checks and README review. Record user/provider/native evidence separately. |

## Exclusions and limits

No A2UI protocol dependency, provider token streaming, new transport or persistent preview history, Basic JSON incremental parsing, A3 invocation policies or ecosystem implementation. Basic JSON retains its final-preview flow. Fast tool batches can finish between polls; only validated snapshots observed by polling are shown. Existing data remains installed and unchanged until explicit approval/install. No paid inference is needed for deterministic acceptance. macOS remains deferred.

## User test after implementation

1. Rebuild the source host with `node scripts/mallea.mjs build`, then start/reopen Core/dashboard using `node scripts/mallea.mjs run` (same root-run commands in PowerShell and Bash/Zsh). Stop the old Core and close Mallea windows first. Configure your single Core model in Agent tools mode.
2. In an app, ask Shape to compose multiple useful Surfaces. When the model applies a valid partial draft, expect a labelled building preview while generation continues. It is a separate local copy: editing it cannot save app data or enable approval/install.
3. On completion, expect the ordinary final proposal and explicit approval/install. Before approval, the actual app remains unchanged. A model that finishes in one fast batch may only expose the final proposal.
4. Repeat and cancel while a preview is visible. Expect it to disappear and no installable late result. Repeat with an actual app-definition edit from another window; the preview must clear as stale. Basic JSON shows its completed proposal as before.

Automated/scripted checks demonstrate transport/state/renderer behavior, not whether a particular provider chooses useful intermediate operations. User/native acceptance and macOS checks remain separately recorded in STATUS.md.
