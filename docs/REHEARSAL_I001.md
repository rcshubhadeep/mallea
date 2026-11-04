# I001 Windows preview evidence — November 4, 2026

Branch: codex/installable-runtime. Main retained at 2fe8c1f4195856b93840eb81bb52282e4430f586. Milestone advanced: post-hackathon installable delivery (E1/E3/E5 extension). Slice remains open for clean-machine/platform acceptance; macOS is the mandatory next target before other feature work.

## Fresh automated checks

- Dependencies initially absent; locked reinstall completed after the restricted-network attempt failed. No dependency versions changed. Fresh focused baseline: 13/13.
- Final focused installed/Core/dashboard/launcher checks: 16/16, including no inherited model profile, strict HTTPS/Meta/session-key validation, secret exclusion from public state/storage, installed creator denial, installed host launch, data retention and refusal to quit while another app is active.
- Full regression: 83/83 sequential. An earlier parallel run overlapped native compilation and failed an existing worker-verification timing assertion (82/83); sequential rerun passed without weakening the test.
- TypeScript and frontend production builds passed. Windows release native build and NSIS bundling passed. Existing large-chunk frontend warnings and an upstream NSIS language-string warning remain; neither prevented building.
- Isolated distribution proof: copied outside checkout, private Node 24.19.0 with empty PATH, concurrent startup/reconnect, no inherited model key, ordinary feedback write, creator/Shape gating, restart persistence and authenticated stop passed. This is not a clean Windows VM result.

## Agent-operated native and installer checks

Used the computer-use skill for native UI inspection and interactions. No user acceptance is implied.

- Initial installation into an isolated preview program folder succeeded (exit 0). No installed Mallea or installed data existed before this test.
- Native testing exposed Windows extended-path entrypoint failure. Host adapter now normalizes OS paths and uses a relative Node entrypoint. Corrected native startup and a subsequent fresh Core start succeeded. The installed build is selected by its explicit host identity and ignores a leftover developer MALLEA_HOST_CONFIG override; the developer build retains that override.
- Dashboard displayed three registered apps (Core, Fieldnote, Parcel), disabled app creation, model setup controls and the no-model Shape explanation.
- Both bundled apps launched from dashboard cards into independent native windows. Parcel feedback posted without a model; Fieldnote saved artwork revision 2 without a model. Closing the dashboard left both apps open.
- Native restart retained both edits and reset model access. Model settings displayed HTTPS endpoint, Meta identity, password entry and session-only explanation. Quit Mallea stopped the dashboard/Core after other apps closed.
- Reinstallation of the corrected installer succeeded (exit 0). Installed Core source matched the checkout. Host matched the built executable except Tauri's expected three-byte UNK-to-NSS bundle marker. Ten Microsoft runtime DLLs were included. Runtime payload contained no .env, database, .key or .pem files.
- Default silent uninstall removed program files while retaining the installed database; reinstall/reopen succeeded and retained the artwork and feedback. This tests same-version replacement, not a future schema/version upgrade.

Final Windows artifact: apps/desktop/src-tauri/target/release/bundle/nsis/Mallea_0.1.0_x64-setup.exe, 30,716,265 bytes. SHA-256: ABE699872192B102D1018D7DE0A8E15ABD8F7EFA10BEEBB8D7D59E260A0F7791.

Bundling used the supported project-local tools cache. The shared NSIS cache had a reparse-point failure; the automatic release download then timed out. Official NSIS 3.13 and nsis_tauri_utils 0.5.3 were downloaded to the local cache and verified against Tauri's expected hashes; no library internals were patched. Subsequent complete installer command succeeded.

## Remaining gates and exact tests

Follow INSTALLER.md acceptance on a clean Windows machine without developer tools: install, open twice (one Core), launch Fieldnote/Parcel, save a revision/comment, close/reopen dashboard, restart, reinstall and default uninstall with retained work. User-supplied actual model execution remains acceptance; no real model credentials or inference calls were used in this slice.

Then execute the macOS build and native checks before any work outside this installer slice: official Node 24.19.0, macOS 13.5 minimum, architecture-matched runtime, no non-system dylib dependencies, .app/.dmg launch, both apps, model setup/gating, independent lifetime, restart/replacement retention, nested executable signing and notarization. macOS execution is untested here. Windows is an unsigned development preview; clean-machine, missing-WebView2 installation, code signing, actual version upgrade and macOS distribution remain unverified.

README reviewed and updated with the installed preview while retaining developer setup. v025 hash and all unaffected v026 bytes verified; active index/CHANGELOG updated. Portability/local documentation links reviewed. User feedback: none yet for I001.
