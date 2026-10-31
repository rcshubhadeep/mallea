# Mallea

Software that takes your shape.

Mallea is a desktop application framework for the age of agents. Apps are built from live, editable Surfaces. A shared local engine supplies Meta-powered authoring, typed data, permissions, MCP discovery and Automations. Each app runs in its own Tauri window and can exchange permitted data with other Mallea apps.

## Product and demo scope

Start at the dashboard: open and inspect local apps, select the shared Meta profile, browse an illustrative app catalogue and create a project. A new project compiles to a blank native app with Shape Your App; build it incrementally. Surfaces and their data can persist or have an explicit session lifetime.

**Working prototype:** a local Core and dashboard, independent native apps on one Surface/model runtime, point-of-use editing, typed data and collections, local persistence, permissioned manual data exchange, shared Meta settings and graphical blank-project compilation/launch.

**Planned:** Surface-scoped sharing and executable Automations with simple trigger/transformation/destination setup. Web product support and Observer are parked. Windows is the tested reference; Linux/macOS await actual native validation. See the [desktop demo plan](docs/DEMO_PLAN.md).

## Open Mallea again

Already installed and built? From the repository root, with Core still running, reopen the dashboard:

```sh
node scripts/launch-app.mjs mallea-core
```

If Core is stopped, first start it in a terminal and leave that terminal open:

```sh
node --env-file=.env scripts/engine.mjs
```

Then run the dashboard command in another terminal. Both commands are the same in Windows PowerShell and Linux/macOS Bash/Zsh. If your model selection is in ignored `docs/private/smoke.env`, start Core with `node --env-file=.env --env-file=docs/private/smoke.env scripts/engine.mjs` instead. Reopening needs no reinstall or rebuild. Closing the dashboard leaves Core and other apps running; after restarting Core, reopen the dashboard too.

Use **Open app** on a dashboard card to launch a registered local app. An already-running app reports that it is open and avoids another window; switch to its existing window. Dashboard-created projects use their own compiled executable. Missing builds/registration show a message instead of starting a rebuild. Concept catalogue entries remain previews only.

## First-time Developer Setup

Run commands from the repository root. You need Node 24, Rust and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/). Core runs separately from its dashboard and app windows.

Install locked dependencies once, after stopping this project's previews/native windows:

| Windows PowerShell | Linux/macOS Bash or Zsh |
| --- | --- |
| `npm.cmd ci` | `npm ci` |

Start Core in one terminal, using ignored configuration for live authoring (same command in all three shells):

```sh
node --env-file=.env scripts/engine.mjs
```

Configure `DEV_API_KEY`, `DEV_BASE_URL` and `DEV_MODEL` for the selected Meta development model. If model selection is in optional ignored `docs/private/smoke.env`, add `--env-file=docs/private/smoke.env` after the first env-file argument. Keys remain in the service. Without model configuration, `node scripts/engine.mjs` runs the starting app but cannot author changes.

Build the current native host in another terminal:

| Step | Windows PowerShell | Linux/macOS Bash or Zsh |
| --- | --- | --- |
| Frontend | `npm.cmd --script-shell=cmd.exe run build` | `npm run build` |
| Native shell | `npm.cmd --script-shell=cmd.exe run desktop -- build` | `npm run desktop -- build` |
| Dashboard | `node scripts/launch-app.mjs mallea-core` | `node scripts/launch-app.mjs mallea-core` |
| Fieldnote | `node scripts/launch-app.mjs scratchpad-main` | `node scripts/launch-app.mjs scratchpad-main` |
| Parcel | `node scripts/launch-app.mjs review-main` | `node scripts/launch-app.mjs review-main` |

Linux/macOS native launch is untested. Platform-specific installers are not supplied yet. Once built, this release host needs Core running. Each launch uses its own ignored host configuration; a URL or frontend switch cannot select another app identity. These local credentials are not production process isolation.

In the dashboard, **Inspect app** shows registered metadata, Surface/model inventory and declared sharing. **Close details** or closing the dashboard leaves other apps running. The six catalogue entries are illustrated concepts with previews, not installable products.

**Model settings** selects one configured Meta profile for all apps. You can enter a replacement key for this Core session; leaving it empty keeps the configured key. Keys are not stored in app models or generated projects. Restarting Core restores environment settings, so reopen the dashboard afterward. “Ready” means configured, not a successful inference probe; no request is charged just by selecting a profile.

Choose **Create an app**, enter a name, pick an existing parent folder, then **Create, compile and open**. Mallea creates a new subfolder, refuses collisions, compiles a blank native app and opens it. Builds run one at a time and reuse the local compiler cache; first builds need downloads and can take minutes. Closing the creator keeps its build running; keep Core running. Failed builds retain the project for diagnosis. In the new app, use **Shape this app** to add working Surfaces. To reopen it later, run `node project-host.mjs start` from that generated project's folder (same command on all platforms).

In Fieldnote, edit the headline/color/note and save a revision. Right-click an element and choose **Modify this surface** for a scoped change. **Shape this app** gives app-wide editing: add Surfaces, create models or rearrange the app. Inspect the preview, approve the declared changes and install. Updates appear without reloading or rebuilding. Existing app data remains separate from presentation. The first upgrade retains a recoverable snapshot of the older workspace and local fields; the old workspace toggle is replaced by the common Surface model.

In Parcel, allow saved-design access and refresh to fetch Fieldnote’s saved image/note. Post feedback in Parcel; in Fieldnote, allow review feedback and check it. These are manual, app-level grants. Automatic sync and Surface-scoped grants are planned. Closing an app changes its Core presence; the other window stays running.

Try “Make this list's text larger, keeping its layout and bindings” in scoped Shape. In global Shape, try “Add an independent Follow-ups Surface with an editable notes field” or create an input, Add button and saved-item list across two Surfaces. Persistent Surfaces/data survive restart. Explicit temporary Surfaces expire after the app closes with a short reconnect grace; removing a Surface retains its model data. Right-click export offers text/JSON and saved PNG data through a native save picker. Set Automation is visibly unavailable until its execution flow is implemented.

### Command-line project creation

After the frontend build, create a new folder (the parent must exist; existing targets are refused):

```sh
node scripts/create-project.mjs .mallea/my-app my-app "My app"
```

Set the Core data folder before changing directories, then install the generated project's own tooling, register, build and launch it:

| Step | Windows PowerShell | Linux/macOS Bash or Zsh |
| --- | --- | --- |
| Locate running Core | `$env:MALLEA_HOME = (Resolve-Path .mallea).Path` | `export MALLEA_HOME="$PWD/.mallea"` |
| Enter project | `cd .mallea/my-app` | `cd .mallea/my-app` |
| Install tooling | `npm.cmd install` | `npm install` |
| Register | `npm.cmd --script-shell=cmd.exe run register` | `npm run register` |
| Compile | `npm.cmd --script-shell=cmd.exe run build` | `npm run build` |
| Launch | `npm.cmd --script-shell=cmd.exe start` | `npm start` |

The initial window has only **Shape this app**. Try adding a local notes field; preview and install. Type a note and wait for “Local changes saved”; reopen to verify it persists. Shape edits need no native rebuild. The project copies the built runtime and native sources and can be moved outside this checkout. Keep Core on the same machine; register again on a different machine. Generated private host credentials and Core model keys are never included in the portable source. Keep the generated lockfile after installing tooling. Source-level changes to the framework require rebuilding and recopying its runtime; live Surface edits do not.

For an existing generated project, close its window, rebuild the framework frontend, then run `node scripts/sync-project.mjs <project-folder>` from this repository root. This updates framework-managed runtime/Rust files and keeps a private backup; it preserves the app manifest, identity and Core data. Rebuild from that project with its documented Windows or Linux/macOS build command, then start it. Use this only for generated projects; custom edits to framework-managed files must be reconciled with the backup. No rebuild is needed for later Surface edits.

### Configuration and prerequisites

Use the official Tauri prerequisite guide for Windows C++ tools/WebView2, macOS Xcode tools and Linux system packages; Rust and Node are required for source builds. First builds can take time and need dependency downloads. No claim of instant cold compilation.

Keep `.env` ignored; copy `.env.example` only when no local file exists. Development uses `DEV_API_KEY`, `DEV_BASE_URL`, `DEV_MODEL`; demo uses `PROD_LLM_KEY`, `PROD_BASE_URL`, `PROD_MODEL`. Only registered Meta model identities appear in dashboard settings. Configure each desired profile's HTTPS API base and model in the environment; its key can come from the environment or session-only dashboard entry. Start Core with `--production` only to explicitly select the demo profile initially. There is no automatic fallback. The inference adapter remains generic internally; model/profile registration is enforced by Core. No persistent OS key storage is implemented.

There is one active local database, ignored `.mallea/workspace.sqlite`; set `MALLEA_DB=.mallea/workspace.sqlite` if overriding configuration. Older test data may exist under ignored archives. Do not create a new active database for every test. Back up with the service stopped and retain WAL/SHM companions when present.

### Reproduce checks

| Check | Windows PowerShell | Linux/macOS Bash or Zsh |
| --- | --- | --- |
| Automated suite, no inference | `npm.cmd --script-shell=cmd.exe test` | `npm test` |
| TypeScript | `npm.cmd --script-shell=cmd.exe run check` | `npm run check` |

On a busy machine, run the suite sequentially, after native compilation finishes (same command in all supported shells):

```sh
node --test --test-concurrency=1 tests/*.test.mjs
```

Expected: 53 passing tests. Concurrent native compilation can exhaust the bounded extension-worker deadlines; do not weaken those limits to compensate for build load.

These cover the current implementation, including dashboard/settings boundaries and project collision/failure handling; Automations remain planned. Optional model checks use isolated services, not the live database (same commands in all shells):

```sh
node --env-file=.env scripts/verify-malleability.mjs
node --env-file=.env scripts/verify-local-surface.mjs --desktop
node --env-file=.env scripts/verify-native-foundation.mjs
node --env-file=.env scripts/verify-live-core.mjs
# Explicit budget-consuming direct Meta compatibility check:
node --env-file=.env scripts/verify-malleability.mjs --production
node --env-file=.env scripts/verify-native-foundation.mjs --production
node --env-file=.env scripts/verify-live-core.mjs --production
```

Each job has an initial request plus at most two repairs, a 60-second request timeout and bounded output; there is no automatic environment fallback. Expected: targeted changes, retained unrelated model/data, then PASS. The foundation check verifies legacy-host compatibility and engine restart persistence. The live-core check creates a two-Surface app using new models/operations, then performs a scoped refinement. Both use isolated data and are service checks, separate from native visual verification. Artifacts/reports stay under ignored `.mallea/`. Add the optional smoke.env argument only if configured locally.

### Troubleshooting and stopping

If port 4318 is already occupied, stop its own terminal before starting Core. The older companion and Core cannot run together on this port. Do not kill unrelated Node processes. Authentication, quota, rate-limit, network and timeout failures are distinct; correct the selected configuration and retry deliberately. A failed generation leaves the installed app unchanged.

If Core was started without a visible terminal, save work and close its apps, then identify the listener before stopping it:

| Windows PowerShell | Linux/macOS Bash or Zsh |
| --- | --- |
| `$malleaCorePid = (Get-NetTCPConnection -LocalPort 4318 -State Listen).OwningProcess` | `lsof -nP -iTCP:4318 -sTCP:LISTEN` |
| `Get-CimInstance Win32_Process -Filter "ProcessId=$malleaCorePid" \| Select-Object Name,CommandLine` | `ps -p <listener-pid> -o command=` |

Only after confirming it is this project's Core, stop that process with `Stop-Process -Id $malleaCorePid` (PowerShell) or `kill -INT <verified-pid>` (Bash/Zsh), then use the normal Core start command. Linux/macOS commands remain untested; Linux systems without lsof can inspect the listener with `ss -lptn 'sport = :4318'`.

Stop the companion/dev terminals with Ctrl+C and close native windows before `npm ci` or replacing dependencies, especially on Windows. After a Windows EPERM interrupted install, stop the identified project processes, complete `npm ci`, then restart. Keep one editing instance for predictable unsaved-draft behavior.

Current limits include a bounded Surface vocabulary and registered operations, no general expressions/native code, no production multi-user isolation and no remote routing. Unsaved canvas drafts are not recovered after close; save revisions explicitly. The graphical creator/catalogue/dashboard remain planned. Core and the apps trust the same local OS user; this is not hostile-process isolation.

[Project documentation](docs/README.md) · [Automation ideas](docs/AUTOMATION_IDEAS.md) · [Current implementation contract](docs/SURFACE_API_004.md)
