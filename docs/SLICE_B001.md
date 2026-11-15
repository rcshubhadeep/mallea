# B001: one-command source build and launch

User-authorized November 15, 2026 alongside A001 review; advances E1/E5 developer reproducibility. This is a bounded convenience wrapper over existing tools, not a build-system migration. Branch codex/source-build-launch is stacked on A001 PR #5 while main stays unchanged.

| Unit | Acceptance |
| --- | --- |
| B1 | Review scripts and fresh startup/launcher baseline; expose a direct Node entry point with default build-and-launch, build-only, launch-existing and help modes. No CMake or new dependency. |
| B2 | Run existing TypeScript/Vite/Tauri steps without shell composition; fail before launching on build errors. Refuse occupied Core port without touching the running process, credentials or data. |
| B3 | Load optional private .env only for Core, launch the dashboard through existing sanitized native launcher, keep one terminal, and close only the owned Core on stop/launch failure. Preserve app independence and data. |
| B4 | Focused lifecycle/failure checks, actual Windows build check, full regression, README with PowerShell/Bash/Zsh commands and exact user handoff. Record platform/native/user limits honestly. |
| B5 | November 15 user-requested clean alias: invoke Cargo clean only for the verified checkout target; refuse redirected paths and an occupied Core port. Do not clean during verification. Preserve settings, app data and unrelated files. |

Exclusions: automatic dependency installation/replacement, stopping existing processes, reuse of a stale Core, consumer auto-update, hot reload, installer generation, generated-project synchronization, new app features and model requests. Custom cross-compilation remains on the existing desktop build interface. Existing low-level commands remain available.

User test: from the checkout root run `node scripts/mallea.mjs`. Expect the build to finish, Core to start and the native dashboard to open without a second terminal. Close app windows and press Ctrl+C; expect the owned Core to stop and saved data to remain. Run `node scripts/mallea.mjs run` to reopen without building. With another Core already running, expect a clear refusal and the existing Core unchanged. macOS/Linux commands are the same Node entry point; fresh platform validation must be recorded before claiming it.

## November 15 evidence and limits

B1-B4 implementation and automated handoff complete. Fresh baseline: 5/5 startup/launcher tests. Four new tests cover arguments, missing dependencies, fail-fast builds, authenticated dashboard startup, launch-failure cleanup, idempotent owned shutdown and occupied-port identity preservation. Full sequential suite: 105/105; the helper checks passed again after making its default database explicitly follow the chosen home. `node scripts/mallea.mjs build` passed TypeScript, both frontends and the Windows release native build; existing frontend bundle-size advisories remain.

The built native dashboard was launched through the helper's real startup function against a fresh ignored test home. Its authenticated native/WebSocket session connected to that Core. Only that test dashboard was terminated, and its owned Core stopped. This establishes startup/connection, not visual/native user acceptance or a real Ctrl+C keypress in a user's terminal. No model request, dependency replacement, installed edition or existing workspace data was used. Temporary project processes are stopped. No runtime changes to Core/Surface contracts; immutable plan snapshots unchanged. README reviewed/updated with quick and manual workflows.

The default build writes to the checkout's standard native target directory, consistently with existing app launching; `CARGO_BUILD_TARGET` must be unset. Cross-compilation/custom build workflows remain on the existing desktop command. Dependencies are a prerequisite, not silently installed. Missing toolchains, locked executables and build errors stop before launch. No existing Core is reused or stopped. The source dashboard starts with developer creation support; this does not modify installed-edition policy or synchronize previously generated projects. macOS/Linux helper behavior and native user acceptance remain unverified; exact user test above is pending user feedback.

Clean alias: `node scripts/mallea.mjs clean` or `npm run clean` (PowerShell: `npm.cmd --script-shell=cmd.exe run clean`). Native manifest/target arguments are fixed to this checkout; parent/target real paths must match before Cargo is invoked. A junction/symlink redirection test uses an injected command runner and retains its sentinel file. The actual clean is not run by automated acceptance; existing compiled artifacts are preserved. This is optional for a fresh rebuild, not a prerequisite to using the helper.
