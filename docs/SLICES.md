# Dependency-ordered desktop-engine slices

Follow PROJECT_PLAN.v023.md. Five milestones map one-to-one to E001-E005. Earlier web/Observer sequences and v019/v020 milestone numbering are historical. Every slice below is defined, not implemented by this planning update.

| Milestone | Slice | Deliverable | Exit gate |
| --- | --- | --- | --- |
| E1: native engine foundation | [E001](SLICE_E001.md) | Generic registry/host, Fieldnote and native Parcel, early blank-project build spike | Independent native identities, current useful data paths retained, portable blank host compiles/launches |
| E2: malleable app core | [E002](SLICE_E002.md) | Independent Surfaces/models/events, context editing, generic operations, live updates/lifetime | Build a useful app incrementally from blank; scoped edits preserve unrelated work and persistent data |
| E3: dashboard and creator | [E003](SLICE_E003.md) | Surface-based dashboard, actual metadata, common Meta settings, catalogue and folder-based creator | Three independent apps, including one created/built/launched from the dashboard, using one engine configuration |
| E4: permissioned Automation | [E004](SLICE_E004.md) | Surface grants, app-scoped MCP access, auto-sync, English Automation flow and real Muse transform | Useful two-way effects, correct deny/revoke, typed output and actual semantic execution |
| E5: runnable submission | [E005](SLICE_E005.md) | Clean setup, final Meta/native rehearsal, three-minute video and submission | Actual runnable source/video/required fields verified; no unsupported claims |

## Why this order

The dashboard must use the same Surface/data API as ordinary apps, so E002 precedes it. E001 still tests blank native compilation early; E002 proves meaningful composition through a temporary/test launch; E003 supplies the polished dashboard creation path. This avoids postponing the riskiest packaging problem or letting dashboard polish displace core malleability.

## Work-unit map

- E001 W1 registry/owner/event metadata; W2 generic native identity/host; W3 portable blank build spike; W4 native Parcel and current sharing; W5 regression/native evidence/README.
- E002 W1 independent Surface/model records; W2 generic data/collections/events/actions; W3 contextual/global authoring and preview; W4 lifetime/removal/export; W5 real blank-app composition/verification/README.
- E003 W1 real dashboard/app detail through Surface API; W2 common Meta model/key settings; W3 folder/scaffold/build/launch; W4 illustrated concept catalogue; W5 end-to-end verification/README.
- E004 W1 app/Surface MCP grants; W2 approved subscriptions/two-way auto-sync; W3 executable pipeline runtime; W4 preset-English three-step authoring; W5 Muse transformer; W6 permissions/failure/restart/native/Meta checks and README.
- E005 W1 clean-run/platform instructions; W2 final Meta/native rehearsal; W3 actual recording/edit; W4 submission/repository/README audit.

Detailed definitions specify unit acceptance, exclusions and target user tests. At each entry re-read status/source/goal and run focused baseline checks. Update current unit/state in STATUS.md; several units may complete before the slice handoff. Never mark a whole milestone complete from one UI or unit test.

## Calendar and cuts

Feature window is October 30-November 1. Tentative budgets: E001 and start of E002 on October 30; complete E002/E003 on October 31; E004/end-to-end integration on November 1. These are tight planning budgets, not verified estimates. Reassess after each slice, especially the compile spike. November 2-3 remains protected for E005 freeze/setup/rehearsal/video; target submission is November 4 morning Eastern Time, exact cutoff pending.

Cut OS metrics, marketplace services/polish, extra Automation examples and optional editor features before the core proof: malleability, two-way permitted data, blank-project creation and substantive Muse execution. Web product delivery, Observer and remote routing remain parked.

Every handoff states milestone advanced, acceptance passed and incomplete work; gives exact user tests/expected results/limits; records automated/native/user evidence separately; and reviews/updates README for reproducibility. README contains product/run guidance, not this internal tracking.
