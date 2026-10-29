# New local fields: corrective acceptance

Date: 2026-10-28. Advances M1; Slice 003A agent verification complete, user acceptance pending. This corrects the missing ability exposed by the user's extra web note request. M2-M4 remain incomplete.

## What changed

The shared declarative Surface grammar now permits up to 16 new text/color fields, with explicit local-write permission. A shared renderer/setter and the existing SQLite/install service persist them by app and stable Surface identity. Domain resources remain independently owned. No Parcel-specific note action, dependency replacement, new generated-script execution or high-level recipe branch was added.

Multiple panels compose into one versioned workspace definition. This does not add independent multi-package installation, arbitrary schemas or cross-app local-field writes. Local means the app/Surface in the companion, not browser-only storage or production user isolation. Stable keys/types preserve values; changing a saved field's type requires a new key.

## Fresh verification

- Baseline: 25 tests and TypeScript passed before correction. Final: 28 tests, TypeScript, both frontend builds and Windows native release build passed. No Linux/macOS execution claimed.
- New deterministic cases cover schema/access/type/size rejection, preview separation, app isolation, disk restart, compatible refinement, field removal/re-addition, type-collision rollback, stale package/state rejection, session scope and disabled contributions.
- Development service check used the user's exact web request, installed a new textarea while retaining artwork, saved a value, then refined while preserving it. Both jobs passed attempt 1.
- Actual Parcel browser: exact request generated a new local field on attempt 1. Preview-only text did not become the installed live note. Typed a distinct live value, observed Local changes saved, reloaded and retained it. The initial generation placed the panel below artwork, so exact placement was not initially satisfied. A real follow-up moved the same field above artwork, labelled Extra notes, and retained its saved value through install/reload. Existing asset note stayed Initial concept for review.
- Actual Windows Fieldnote: requested a separate new local textarea above the canvas, independent from Revision note. First proposal had an incompatible input binding; the existing bounded loop repaired it once and reached ready on attempt 2. Preview-only desktop text did not become the live note. Typed a distinct desktop value, observed Local changes saved, closed/reopened the release app, and retained it. Revision note stayed unchanged. Parcel retained its different note afterward.
- Visual artifacts are retained locally under ignored .mallea/screenshots/slice003a-parcel.png and slice003a-fieldnote.png. These are real configured-development model runs, not a direct-Meta native recording.

## Inference accounting

| Check | Attempts/responses | Reported tokens | Reported cost |
| --- | --- | --- | --- |
| Development service initial | 1 | 6,531 | 0.01627615 |
| Development service refinement | 1 | 5,836 | 0.012128 |
| Actual web initial | 1 | 5,788 | 0.0131184 |
| Actual native initial + repair | 2 | 4,816 + 5,669 | 0.008231 + 0.01097725 |
| Actual web layout refinement | 1 | 5,278 | 0.0095225 |
| Development total | 6 responses | 33,918 | 0.0702533 |
| Direct Meta muse-spark-1.3 service check | 1 | 6,588 | Not returned |

Direct Meta checked one exact web-request generation and the local install/save path, passed attempt 1 in 15,046 ms. It is separate from browser/native evidence. No production fallback or extra production refinement. Service artifacts/reports are retained under ignored .mallea/local-surface-checks/. Monetary numbers above are provider-reported, not an independently reconciled bill.

## One active workspace

The user did not know the current database and authorized clearing/consolidation. Stopped the identified old service, moved 16 root SQLite/companion/backup files into a timestamped ignored .mallea/archive/ directory, and started the updated service using .mallea/workspace.sqlite. This path is both the service default and the ignored local configuration. No credentials were printed or changed; prior test work remains recoverable. Source, dependencies and model artifacts were retained.

Root README documents selecting this database, clearing an inherited terminal override, stopping before copying SQLite files, and retaining WAL/SHM companions. New machines create the single configured database on first start; historical archives exist only on machines where prior tests were consolidated.

## User test

Follow root README See it running; use the updated service and rebuilt native app. Existing previews/service remain available in the current session; stop project previews and native windows before npm ci. Keep one editing native instance.

1. Reload Parcel or reopen Fieldnote. Inspect the already-installed separate notes panels if using the current workspace.
2. To create another field in either app, open Shape this app and request: "Add another separate notes panel above the existing content, with a multiline text box. Keep the existing notes and app content."
3. Build, inspect the preview and its placement, approve requested access, then Install Surface. Preview edits must not become newly initialized live values.
4. Type different notes in web and desktop. Wait for Local changes saved, or use Save local changes. Reload web and close/reopen desktop: each app keeps its own note, while the asset/revision notes retain their separate contents.
5. Request "Move the new notes panel below the current content; keep its saved value and existing local state key." Preview/install: the note should remain. If a generated layout misses a detail, refine it before accepting; validation does not prove every natural-language instruction was met.

Known limits: 16 text/color fields, text up to 2000 characters, one composed installed workspace, small registered component/action vocabulary, no production account isolation or general data migration. Save before closing; ordinary unsaved canvas/revision drafts still require Save revision. Observer, publishing Automations, feedback return and keyless delivery are not implemented by this correction.

README gate passed: vocabulary, behavior, saves, setup/run/verification and database troubleshooting reviewed and updated; product-facing README has no slice/work-unit tracking. User feedback on this correction is still pending.
