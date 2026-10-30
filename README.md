# Mallea

Software that takes your shape.

Mallea is a desktop application framework for the age of agents. Apps are built from live, editable Surfaces. A shared local engine supplies Meta-powered authoring, typed data, permissions, MCP discovery and Automations. Each app runs in its own Tauri window and can exchange permitted data with other Mallea apps.

## Product and demo scope

The target experience starts at a dashboard: inspect running apps, configure the common Meta model, browse an illustrative app catalogue and create a project. A new project compiles to a blank native app with Shape Your App; users then build it incrementally. Surfaces and their data can persist or have an explicit session lifetime.

**Working prototype:** a local Core registry, independent native Fieldnote and Parcel, Surface-defined interfaces, targeted edits, local field persistence, and permissioned manual data exchange. A command-line creator packages a portable blank native project with Shape access.

**Planned:** engine dashboard, graphical project creator, independent Surface/model composition, right-click Surface editing, Surface-scoped sharing and executable Automations with simple trigger/transformation/destination setup. Web product support and Observer are parked. Windows is the tested reference; Linux/macOS await actual native validation. See the [desktop demo plan](docs/DEMO_PLAN.md).

## Run the current native prototype

Run commands from the repository root. You need Node 24, Rust and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/). This runs Core and two independent apps; the dashboard is planned.

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
| Fieldnote | `node scripts/launch-app.mjs scratchpad-main` | `node scripts/launch-app.mjs scratchpad-main` |
| Parcel | `node scripts/launch-app.mjs review-main` | `node scripts/launch-app.mjs review-main` |

Linux/macOS native launch is untested. Platform-specific installers are not supplied yet. Once built, this release host needs Core running. Each launch uses its own ignored host configuration; a URL or frontend switch cannot select another app identity. These local credentials are not production process isolation.

In Fieldnote, edit the headline/color/note and save a revision. Choose **Shape this app**, request a local change such as bold saved-version text or an extra notes panel, inspect the proposed changes/preview, approve access and install. Reopen to check persistence. **Show built-in app** retains the saved customization while showing the original interface. Current activation still versions a composed workspace; independent contribution management is planned.

In Parcel, allow saved-design access and refresh to fetch Fieldnote’s saved image/note. Post feedback in Parcel; in Fieldnote, allow review feedback and check it. These are manual, app-level grants. Automatic sync and Surface-scoped grants are planned. Closing an app changes its Core presence; the other window stays running.

### Try a blank native project

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

## Developer Setup

### Configuration and prerequisites

Use the official Tauri prerequisite guide for Windows C++ tools/WebView2, macOS Xcode tools and Linux system packages; Rust and Node are required for source builds. First builds can take time and need dependency downloads. No claim of instant cold compilation.

Keep `.env` ignored; copy `.env.example` only when no local file exists. Set the variable names above without committing values. Optional direct-Meta checks use `PROD_LLM_KEY`, `PROD_BASE_URL` and `PROD_MODEL`, selected explicitly with `--production`. The new dashboard Meta-only catalogue/key settings are not implemented yet; the existing inference adapter remains generic internally.

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

Expected: 39 passing tests. Concurrent native compilation can exhaust the bounded extension-worker deadlines; do not weaken those limits to compensate for build load.

These cover the existing implementation, not unbuilt dashboard/Automation features. Optional model checks use isolated services, not the live database (same commands in all shells):

```sh
node --env-file=.env scripts/verify-malleability.mjs
node --env-file=.env scripts/verify-local-surface.mjs --desktop
node --env-file=.env scripts/verify-native-foundation.mjs
# Explicit budget-consuming direct Meta compatibility check:
node --env-file=.env scripts/verify-malleability.mjs --production
node --env-file=.env scripts/verify-native-foundation.mjs --production
```

Each job has an initial request plus at most two repairs, a 60-second request timeout and bounded output; there is no automatic environment fallback. Expected: targeted changes, retained unrelated model/data, then PASS. The foundation check uses an isolated temporary database and verifies a newly registered app, live notes authoring, approved install and persistence across an engine restart. These are service checks, separate from native visual verification. Artifacts/reports stay under ignored `.mallea/`. Add the optional smoke.env argument only if configured locally.

### Troubleshooting and stopping

If port 4318 is already occupied, stop its own terminal before starting Core. The older companion and Core cannot run together on this port. Do not kill unrelated Node processes. Authentication, quota, rate-limit, network and timeout failures are distinct; correct the selected configuration and retry deliberately. A failed generation leaves the installed app unchanged.

Stop the companion/dev terminals with Ctrl+C and close native windows before `npm ci` or replacing dependencies, especially on Windows. After a Windows EPERM interrupted install, stop the identified project processes, complete `npm ci`, then restart. Keep one editing instance for predictable unsaved-draft behavior.

Current limits include a bounded Surface vocabulary and registered operations, no general expressions/native code, no production multi-user isolation and no remote routing. Unsaved canvas drafts are not recovered after close; save revisions explicitly. The graphical creator/catalogue/dashboard remain planned. Core and the apps trust the same local OS user; this is not hostile-process isolation.

[Project documentation](docs/README.md) · [Automation ideas](docs/AUTOMATION_IDEAS.md) · [Current implementation contract](docs/SURFACE_SDK.md)
