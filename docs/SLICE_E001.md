# E001: engine registry and independent native apps

State: implementation and acceptance checks completed on Windows; user acceptance pending. Advances E1. Evidence and user steps: REHEARSAL_E001.md and root README. Plan v021 unchanged. Initial baseline: 36 tests and TypeScript; final evidence: 39 sequential tests, TypeScript, independent native apps and separate portable project build.

## Bounded outcome

Keep existing app behavior/data and targeted edits. Replace the scratchpad-only native entry with a generic manifest/identity path. Register and run Fieldnote and Parcel as two distinct native apps. Prove early that a new portable project can compile to a blank Tauri app with Shape access. Dashboard polishing waits until this riskiest build path is understood.

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Fix minimal app/instance/Surface/model descriptor shapes, element owner IDs and declared event/trigger metadata; persist app metadata and register dynamic IDs instead of only known kind switches | Two independent app records with name/author/purpose, schemas, Surface references and real presence; unknown/malformed identities denied; no credentials in metadata. Context-menu implementation remains E002; metadata must make ownership/eligibility discoverable. |
| W2 | Generic native host bootstrap and trusted engine connection/context; shared renderer consumes selected app descriptor | App identity is native/runtime context, not a user-writable switch granting another app's access; app window title/ownership correct; normal app UI through Surface API; framework Shape available |
| W3 | Portable project/template spike in an ignored test folder; minimal blank manifest, runtime artifact and actual Tauri build/launch | Compiles/launches outside original checkout with relative runtime references, unique app ID and no seeded content beyond Shape; edits do not require shell recompilation; record cold/cached build behavior and prerequisites |
| W4 | Move Parcel's existing presentation/review adapter to the native host; keep Fieldnote separate; exercise current data exchange | Two native apps simultaneously registered; closing one changes its presence; dashboard is not needed to keep windows alive; save/read and feedback paths remain useful, with current permissions honestly scoped |
| W5 | Focused regression/migration/restart, actual native check, documentation and user handoff | Existing data/install state retained or recoverably migrated; separate identity/denial checks pass; exact source/build/run steps documented for Windows and parallel untested Linux/macOS; report scoped E1 acceptance |

Keep W1/W2 small enough to reach the compile spike promptly. Use existing SQLite/MCP/sockets/Tauri CLI and renderer. Do not introduce a new service fleet, plugin manager, schema editor or build daemon. Do not scaffold into a user-selected real directory during automated tests; the visible folder picker belongs to E003. Refuse existing-target collisions.

## User acceptance test

Implemented commands are in root README; detailed evidence and expected results are in REHEARSAL_E001.md:

1. Start the engine and launch Fieldnote and native Parcel independently. Inspect distinct identities and original interfaces.
2. Edit/save and exchange current data in both directions. Close/reopen one app and verify presence and persistence.
3. Compile/launch the generated blank test project. It should be a real native window with only Shape access and its own app identity.
4. Verify generated project references remain portable when placed outside the framework source folder. No model key appears in its files or metadata.

## Explicit exclusions

No finished dashboard or app store, credential-settings UI, user folder picker, full dynamic collection authoring, complete Surface-scoped sharing, automatic sync, semantic Automation or Observer in this slice. Those remain E002-E004, and current app-level grants must not be described as Surface-scoped enforcement. The scaffold spike proves native packaging; E002 proves meaningful incremental app creation.

At completion review README, update STATUS.md with measured build/native evidence and user steps, then re-review baseline/goal before defining the next slice. Do not mark E1 complete if the scaffold build or second native app remains unverified.
