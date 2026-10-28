# Project plan revision history

## v001 - 2026-10-27

- Created PROJECT_PLAN.v001.md as the initial implementation baseline.
- Captures the malleable app framework, built-in agent builder, desktop/web demo, MCP integration direction, ten-day execution sequence, deliverables, and acceptance gates.
- Incorporates separate development and production inference configuration and limited production budget.
- Marks unverified integrations and conceptual design choices as pending validation.
- No previous snapshot exists; exact-preservation comparison is not applicable.

## v002 - 2026-10-27

- Added one paragraph in section 7 defining the initial QuickJS/WebAssembly worker boundary and its limits, based on the implemented and tested runner.
- Previous file: PROJECT_PLAN.v001.md. New file: PROJECT_PLAN.v002.md.
- Verified the previous snapshot remained unchanged and every byte before and after the insertion matches the previous file exactly, including original line endings.
- Previous SHA-256: c5d8d1354c72e7d51063f30302d8d6c056ce0c73bd2de10832bf16d373f71d5d.
- New SHA-256: 1089f74f5bad3325fab0f2d000b71e2b099a7250ed53ce5af7b9796fa1a05cbd.

## Portability redaction and v003 - 2026-10-27

- User requested removal of all real machine paths. As a narrow exception to snapshot immutability, replaced the external sample's machine-specific location with a relative sibling-directory reference in v001 and v002. No other bytes changed in either redaction. Earlier hash entries remain an accurate historical record of their pre-redaction state.
- Redacted v001 SHA-256: 654fac06c8b2a9ff14699597842481ca1683aa4c8ee09930a0d4aee5bbee4e2f.
- Redacted v002 SHA-256: 8eb31514be8d6c298bf4b0ad480c317fd683702cf27af350c2374088ed9d67ec.
- Created PROJECT_PLAN.v003.md from the redacted v002. Added the planned proactive observer in section 8, updated day 8's execution milestone, and added its deliverable. All unaffected byte segments were verified identical; v002 remained unchanged during version creation.
- v003 SHA-256: dcfe8082983cb894d1cc1d1548cd4964a4fcb4e125b7276593109456fd5480fd.
- README now leads with the runnable preview; detailed reproduction material is grouped under Developer Setup. Added standing portability and README-order rules to AGENTS.md.

## v004 - 2026-10-27

- Created PROJECT_PLAN.v004.md from v003 with one insertion before section 6 defining the Slice 001 implementation boundary: SDK 0.2 declarative UI plus isolated behavior, two initial policies, SQLite, and local session protection.
- This narrows the initial slice honestly while retaining the larger framework goal. Full agent records, cross-app registration, rollback controls, and production authentication remain later work.
- Verified every original byte before and after the insertion is unchanged, including line endings; v003 remained byte-identical.
- Previous SHA-256: dcfe8082983cb894d1cc1d1548cd4964a4fcb4e125b7276593109456fd5480fd.
- New SHA-256: d5b7fe484f4ab0577ff370d07970140f3ebf7c222e54dddfd96d9915b46c6989.

## v005 - 2026-10-27

- Added one section before section 6 recording the capability audit, explicit unsupported result, and the planned Slice 002 focus on app contracts and cross-app evidence. Configurable thresholds remain a gated follow-on candidate.
- Previous snapshot: PROJECT_PLAN.v004.md; new snapshot: PROJECT_PLAN.v005.md.
- Verified every unaffected byte before and after the insertion is identical, and v004 is unchanged.
- Previous SHA-256: d5b7fe484f4ab0577ff370d07970140f3ebf7c222e54dddfd96d9915b46c6989.
- New SHA-256: 4b762a24e68f6f002803ee7eea8ff2914431334f163e91299dd535860d5ad46d.

## v006 - 2026-10-27

- One insertion before section 6 records native frame delivery, pinned MCP/connection versions and transport responsibilities, local session limitations, and backed-up per-app SQLite migration.
- Previous snapshot: PROJECT_PLAN.v005.md; new snapshot: PROJECT_PLAN.v006.md. Every unaffected byte verified identical; v005 unchanged.
- Previous SHA-256: 4b762a24e68f6f002803ee7eea8ff2914431334f163e91299dd535860d5ad46d.
- New SHA-256: e32d235cad97029358e81519bac934e1820d338eed38bf3e7b4c137f373d35f3.

## v007 - 2026-10-27

- Replaced only section 11's scheduling preface with the user-supplied November 4 morning Eastern Time target, approximate nine-day runway, and final-two-day recording/submission reserve. Exact cutoff hour remains unknown.
- Previous snapshot: PROJECT_PLAN.v006.md; new snapshot: PROJECT_PLAN.v007.md. Every unaffected byte verified identical; v006 unchanged.
- Previous SHA-256: e32d235cad97029358e81519bac934e1820d338eed38bf3e7b4c137f373d35f3.
- New SHA-256: 8e5b8cf4ad00da8e7f5cb6e72e9f81488c1b02b3ceac45386c5e26437194fb74.

## v008 - 2026-10-27

- Applied six localized changes in sections 1, 3, 4, and 11 for the user's priorities: bidirectional application behavior, compelling demo, and reliable guided try mode across a few explicit workflows.
- Added the planned web retest/native result closed loop, expanded follow-up action, and honest saved-artifact replay expectations. Reprioritized the next slice ahead of broad lifecycle management. These are planning changes; reverse workflow and try mode are not yet implemented.
- Previous snapshot: PROJECT_PLAN.v007.md; new snapshot: PROJECT_PLAN.v008.md. Unaffected byte ranges verified for each replacement; reversing all six changes reconstructs v007 byte-for-byte. v007 is unchanged.
- Previous SHA-256: 8e5b8cf4ad00da8e7f5cb6e72e9f81488c1b02b3ceac45386c5e26437194fb74.
- New SHA-256: 555a8db6a713fa3a53ea03b97a33f7b80337efc4e2ab9ee262f0724807fb2ad3.
- Replaced the mutable proposed Slice 003 breakdown to follow the new priorities; its prior lifecycle-first proposal is retained byte-for-byte in docs/archive/SLICE_003.lifecycle-proposal.md. Updated standing work guidance, status, and progress-review recommendations.

## v009 - 2026-10-27

- Corrected the v008 interpretation after the user clarified the philosophy: bounded UI/layout vocabulary, live application malleability, first-class human/agent participation, and bidirectional capabilities are one framework goal. Communication alone or a fixed retest recipe must not become the product.
- Applied 10 localized changes in sections 1-5 and 11, including a focused live-app-model implementation boundary before section 6 and a reframed illustrative demo. Retest is an optional example, not a required subsystem.
- Previous snapshot: PROJECT_PLAN.v008.md; new snapshot: PROJECT_PLAN.v009.md. Each unaffected byte segment verified; reversing all changes reconstructs v008 byte-for-byte. v008 remains unchanged.
- Previous SHA-256: 555a8db6a713fa3a53ea03b97a33f7b80337efc4e2ab9ee262f0724807fb2ad3.
- New SHA-256: eed51865f771930851c05719279a7566cf02725a8646b74436acfeb5f0263682.
- Updated FOUNDATION.md and standing guidance; the mutable Slice 003 proposal now follows the live-model foundation. Its preceding communication-first proposal is retained byte-for-byte in docs/archive/SLICE_003.communication-proposal.md.

## v010 - 2026-10-27

- Clarified the Observer as the sole default agent, distinguished the always-present builder capability and user-created agents, and recorded bounded execution plus future classic-app adapter compatibility. Spreadsheet/month-folder and word-processor examples remain illustrative, not products to build.
- Added a mandatory README review/update gate at every slice handoff.
- Applied 10 localized replacements/insertions. Previous snapshot: PROJECT_PLAN.v009.md; new: PROJECT_PLAN.v010.md. Every unaffected segment verified; reversing changes reconstructs v009 byte-for-byte. v009 unchanged.
- Previous SHA-256: eed51865f771930851c05719279a7566cf02725a8646b74436acfeb5f0263682.
- New SHA-256: 4636795545595642b04cd6d634fa1cbec1aa5136ca4bacf359aad47789adf813.

## v011 - 2026-10-28

- One insertion in section 9 records the user's boundary: exchange data/state/events and permitted actions via the existing protocol approach; each app renders its own UI. Cross-app visual-element/view-tree transfer is out of scope. Shared framework components and images carried as data remain distinct from remote UI transfer.
- Previous: PROJECT_PLAN.v010.md; new: PROJECT_PLAN.v011.md. Every unaffected byte verified identical; v010 unchanged.
- Previous SHA-256: 4636795545595642b04cd6d634fa1cbec1aa5136ca4bacf359aad47789adf813.
- New SHA-256: 3107f18f059086edb4fa4ca05bb255e5a4f45cc1413d7c136d1be3530f05990a.


## v012 - 2026-10-28

- Accepted scratchpad/local asset-review demo, Surface/Automation contributions, minimal provenance, local activation and source-run delivery; deferred hosted HTTPS, schema-upgrade handling and broad infrastructure. Library reuse must fit Mallea contracts through small adapters, not force API workarounds.
- Replaced demo/video and execution sections, updated behavior/deliverables/Observer examples, inserted minimal architecture boundary and clarified historical investigations. Active details in FOUNDATION_PLAN.md, DEMO_PLAN.md, SLICES.md and SLICE_003.md through SLICE_006.md. Former broad 003 archived byte-for-byte. No runtime changes.
- Previous PROJECT_PLAN.v011.md unchanged; new PROJECT_PLAN.v012.md created by byte copy and 15 localized edits. Reversing edits reconstructs every previous byte, including whitespace/line endings.
- Previous SHA-256: 3107f18f059086edb4fa4ca05bb255e5a4f45cc1413d7c136d1be3530f05990a.
- New SHA-256: bfbfcf9ccc5714a09df955d2c2d4a776e2e95ce8e5f8dfe4a7b1e074539b3ea0.
