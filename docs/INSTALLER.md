# Installed Mallea preview

Development branch: `codex/installable-runtime`. Windows x64 preview first; macOS packaging and native verification are the mandatory next gate before work beyond this installer slice. Linux installers are excluded. No public release, Windows signing or macOS notarization is claimed.

## Use the Windows preview

1. Run Mallea_0.1.0_x64-setup.exe. The per-user installer includes Core, private Node, the desktop host, Fieldnote and Parcel. It installs WebView2 if missing; that prerequisite download needs internet. No Git, Node installation, npm, Rust or compiler is needed to use the installed edition.
2. Open Mallea from its shortcut. Core starts automatically; the dashboard opens Fieldnote/Parcel in independent windows. Drawing, saved revisions, review feedback and deterministic operations work without an LLM. Sharing still requires explicit owner-approved grants.
3. For Shape/Muse processing, open dashboard Model settings, enter your HTTPS API base URL, choose a registered Meta model and enter your API key. The provider must support compatible chat completions. Configuration is held in Core memory for this session; re-enter it after Core restarts. A supplied key does not verify provider access; the first request may report an account/model/endpoint error. No model access or credits are included.
4. New-app creation is unavailable in the installed edition. Source/developer project creation remains available.
5. Closing the dashboard leaves other apps and Core running. To stop Core, close Fieldnote/Parcel, reopen the dashboard, then Model settings -> Quit Mallea. Active apps prevent Core shutdown.

Installed data is separate from source .mallea data, under the OS per-user application-data folder with identity dev.mallea.runtime. No developer database or credentials are migrated. Close apps before reinstalling/upgrading; the installer stops only the authenticated installed Core. Default uninstall retains data; selecting its explicit data-deletion checkbox removes it. There is no automatic updater.

Only one Core can use local port 4318. Stop developer Core before opening the installed edition, or vice versa. Port conflicts report an error rather than stopping another process. Fixed diagnostics are in core.log in the installed data folder. Current permissions remain a local single-user prototype boundary, not hostile-process isolation.

## Build from source

Builder requirements: official Node 24.19.0 binaries, locked dependencies, Rust and the existing platform prerequisites in the root README. Stop identified project sessions before reinstalling dependencies; never stop unrelated Node processes.

PowerShell, repository root:

    git switch codex/installable-runtime
    npm.cmd ci --script-shell=cmd.exe
    npm.cmd --script-shell=cmd.exe run installer

macOS Bash/Zsh, on the Mac's own architecture (mandatory next gate; not verified by a Windows build):

    git switch codex/installable-runtime
    npm ci
    npm run installer

The build creates fresh staging under ignored .mallea/distribution/, copies runtime code/assets and the dependency closure, includes Node/dependency licenses, and builds the host and installer. No environment file, model key, database, developer registration or private documentation is bundled. Existing staging is retained for diagnostics; package:runtime refuses existing targets.

Windows output: apps/desktop/src-tauri/target/release/bundle/nsis/Mallea_0.1.0_x64-setup.exe. macOS target outputs are .app/.dmg under apps/desktop/src-tauri/target/release/bundle/. The macOS target minimum is 13.5, matching the [bundled Node requirements](https://github.com/nodejs/node/blob/v24.19.0/BUILDING.md#platform-list). Packaging rejects Node binaries that link non-system dylibs (for example Homebrew dependencies). Actual architecture, native execution, nested private-Node signing and notarization must be verified on macOS. Signing credentials are external build configuration, never app payloads. Public macOS distribution remains gated until signed/notarized delivery is checked.

Checks, from the repository root (same node commands in PowerShell and Bash/Zsh):

    node --test tests/installed-runtime.test.mjs tests/engine-start.test.mjs tests/dashboard.test.mjs tests/app-launcher.test.mjs
    node --test --test-concurrency=1 tests/*.test.mjs
    node scripts/verify-installed-runtime.mjs <staged-runtime-folder>

The isolated distribution check copies staging outside the checkout, clears the executable search path, verifies concurrent startup/reconnect, feedback persistence, model/creation gating and authenticated shutdown. It refuses an occupied Core port and never uses real model credentials. It is distinct from native UI, installer, clean-machine and user acceptance evidence.

## Host boundary

services/workspace/runtime-contract.mjs defines format/version and trusted host/resource paths. Core uses those paths for included-app launch and imports no Tauri API. scripts/installed-bootstrap.mjs authenticates readiness and serializes startup; scripts/installed-engine.mjs runs detached Core. apps/desktop/src-tauri/src/platform_host.rs adapts Tauri OS paths/process startup to this contract; packages/runtime/native.ts contains the frontend invocation adapter. Replacing the host means implementing those operations, without rewriting Surface definitions, model storage or grants.

## Acceptance

- Install without developer tools; open twice and expect one Core. Launch both apps from the dashboard.
- Save artwork/feedback without model access. Close the dashboard; apps must keep working.
- Restart Core/apps; expect retained work and unconfigured model access.
- Before model configuration, Shape must explain the requirement and make no inference request. After configuration, explicitly try a model feature; no hidden fallback.
- Installed app creation stays unavailable, including direct Core requests.
- Reinstall the same version, then check an actual version upgrade when available; retain data. Default uninstall retains it.
- Repeat native flows on macOS after Windows. Check signing/notarization, text input, windows, shutdown and private runtime execution on a clean Mac.

Record agent-operated and user checks separately in STATUS.md. Do not infer user/clean-machine results from automated checks.
