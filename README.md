# Mallea

Software that takes your shape.

Mallea is an application framework for humans and agents. Users reshape software while using it: an Observer suggests improvements, and a built-in builder creates persistent interfaces (Surfaces) and task Automations. Apps exchange permitted data and actions while keeping their own interfaces. The long-term ambition is to rethink software foundations for the agent era, starting with this framework.

## Hackathon demo scope

Two distinctly designed apps: a desktop visual scratchpad and a local web asset-review board. Muse powers the Observer and builder: bring a frequently used color control beside the canvas, automate publishing saved images and notes, and bring review feedback back to the desktop. Changes persist across reloads.

**Available now:** image annotation, model-authored Surfaces with new local fields in either app, and manual saved-design transfer. Observer, publishing Automations and feedback return are not yet available. Windows is the reference platform; macOS/Linux await testing. See the [demo plan](docs/DEMO_PLAN.md).

## Builder vocabulary

- **Layouts:** vertical stack, two-column split, grid.
- **Components:** text, image, single-line input, multiline text area, color picker/hex field, action button, repeated text list, and app-provided components such as the canvas.
- **Data:** existing permitted app fields, plus up to 16 new app-local text/color fields per Surface. Text fields hold up to 2000 characters.

These can be composed into additional panels in either app. For example: "Add a new notes panel above the current content, with a multiline text box. Keep the existing content." This creates a new local field; it does not need to edit the asset note or desktop revision note. See the [Surface contract](docs/SURFACE_SDK.md) for limits.

The color control accepts any six-digit hex color. A fixed set of clickable swatches or a restricted palette is not yet supported; reference colors can be shown as text beside the picker.

## See it running

Run commands from the repository root. You need Node 24; native development also needs Rust and the [platform prerequisites](#preparing-for-the-application-scaffold). Install locked dependencies once: Windows PowerShell: `npm.cmd ci`; Linux/macOS: `npm ci`. Stop this project's previews/native app before installing dependencies, especially on Windows.

**1. Start the local service** (PowerShell, Bash or Zsh):

```sh
node --env-file=.env services/workspace/server.mjs --studio
```

Your ignored .env needs `DEV_API_KEY`, `DEV_BASE_URL` (HTTPS API base) and `DEV_MODEL` for live authoring. If model selection is in optional ignored `docs/private/smoke.env`, use `node --env-file=.env --env-file=docs/private/smoke.env services/workspace/server.mjs --studio`. Keys remain in this service. Without inference configuration, `node services/workspace/server.mjs --studio` runs the starting apps; fresh Surface generation needs configuration. Keyless replay of generated artifacts is not yet available.

**2. Start the two frontends in separate terminals:**

| App | Windows PowerShell | Linux / macOS |
| --- | --- | --- |
| Parcel web app | `npm.cmd --script-shell=cmd.exe run dev:web` | `npm run dev:web` |
| Fieldnote frontend | `npm.cmd --script-shell=cmd.exe run dev:desktop-ui` | `npm run dev:desktop-ui` |

Open [Parcel](http://127.0.0.1:5173). [Fieldnote in the browser](http://127.0.0.1:5174) is a convenient preview; it does not replace native testing.

**3. Launch the actual desktop** in another terminal:

| Windows PowerShell | Linux / macOS |
| --- | --- |
| `npm.cmd --script-shell=cmd.exe run desktop -- dev` | `npm run desktop -- dev` |

Or build the release once: `npm.cmd --script-shell=cmd.exe run build` then `npm.cmd --script-shell=cmd.exe run desktop -- build` on Windows; `npm run build` then `npm run desktop -- build` on Linux/macOS. Launch the built Windows executable with `& .\apps\desktop\src-tauri\target\release\mallea-desktop.exe`, Linux with `./apps/desktop/src-tauri/target/release/mallea-desktop`, or macOS with `./apps/desktop/src-tauri/target/release/mallea-desktop` (source-built executable; no signed app installer claimed). Release mode needs only the service and Parcel frontend; stop Fieldnote's frontend if not using native dev mode. Native Linux/macOS execution is untested.

### Try shaping the apps

Both apps include **Shape this app** in the top bar. Each app has its own Surface, layout, local values and installed version. Sharing image/note data does not copy the interface. New local fields save after a short editing pause or leaving the field; **Save local changes** also saves explicitly. Wait for **Local changes saved** before closing/reloading. Preview text is never installed as live note content.

1. In Fieldnote, edit **Annotation** and **Revision note**. Double-click/drag the canvas title if desired. **Edit** opens the original annotation-color control. **Save revision** stores a PNG and note together.
2. Choose **Shape this app**, keep or change the request, then **Build Surface**. The model receives the current workspace and registered capability contract. Generation has at most two repairs; unsupported requests can be declined.
3. In preview, change the annotation or color. Only the preview copy changes. Approve requested access and **Install Surface**. The installed workspace uses the original live draft, not preview edits.
4. Use the generated color control. Request another composition, for example: "Keep the working color control and editable fields, but group controls above the canvas in a vertical stack. Add the heading Creative controls." Build, preview and install. Compatible draft state remains.
5. **Save revision**. In Parcel, **Allow saved-design access**, then **Refresh saved design**. The image/note and source revision update through MCP and the connected owner. Unsaved Fieldnote edits do not publish. Refreshing unchanged data does not create a new published revision.
6. Reload/reopen: installed Surface and saved data remain. **Disable Surface** restores the starting workspace; **Enable Surface** restores the installed version. Revoking read access blocks further reads but does not delete the copy already published. Close Fieldnote to test source-offline feedback; reopen it to retry.

Only saved revisions persist as app edits; unsaved editing drafts are not recovered after closing/reloading. Keep one editing Fieldnote instance for predictable draft behavior. Observer, feedback return, automatic publication, generic uploads, arbitrary plugins and base-app upgrade handling are not implemented. Contributions use a small declarative vocabulary; no generated JavaScript executes in the new Surface renderer. The existing legacy sandbox remains separate.

Stop each dev/service terminal with Ctrl+C and close the native window. There is one active database: ignored `.mallea/workspace.sqlite`. Keep `MALLEA_DB=.mallea/workspace.sqlite` in your ignored .env. Earlier test databases have been moved under `.mallea/archive/` and are inactive, recoverable backups. Do not choose a different database for each test.

If an older terminal still overrides MALLEA_DB, clear that override once before starting the service so it uses .env: PowerShell `Remove-Item Env:MALLEA_DB -ErrorAction SilentlyContinue`; Bash/Zsh `unset MALLEA_DB`. The service creates the configured database on first run. Stop the service before moving/copying databases; retain SQLite WAL/SHM companions if present. [Legacy walkthrough](docs/LEGACY_REVIEW.md).

See [Surface SDK](docs/SURFACE_SDK.md), [demo plan](docs/DEMO_PLAN.md), [status](docs/STATUS.md), and [project documentation](docs/README.md). Run from source using the commands above. Native installers and keyless artifact replay are not yet available.

## Developer Setup

### Model request failures

The builder distinguishes authentication rejection, insufficient credit/quota, rate limiting, service unavailability, network failure and a 60-second timeout. It stops without automatically retrying or switching inference environments; your installed Surface remains unchanged. Check the selected development/production configuration, wait if rate-limited, then submit again manually. Configuration names and startup commands are above and below; never paste key values into reports. After updating service code, stop its terminal with Ctrl+C and restart the same service command; no desktop rebuild is needed for service-only error-reporting changes. These instructions apply to PowerShell, Bash and Zsh.

If port 4318 is already occupied, the companion may still be running in an earlier terminal. Reuse it, or stop that project's service before starting another; do not start multiple companions against the same database. Do not stop unrelated processes.

### Verify new local fields

These optional commands use isolated in-memory services, not your active database. They make real model calls; each job allows an initial request plus two repairs. PowerShell/Bash/Zsh:

```sh
# Exact web note-panel request, then a refinement that must preserve its value:
node --env-file=.env scripts/verify-local-surface.mjs --refine
# Same facility with the desktop contract:
node --env-file=.env scripts/verify-local-surface.mjs --desktop
# Optional explicit direct Meta check (one job):
node --env-file=.env scripts/verify-local-surface.mjs --production
```

Add the optional smoke.env argument as described above only when needed. Expected: ready jobs, declared new local textarea, retained existing app content, successful local write/refinement, then PASS and numeric usage. Artifacts/reports go under ignored .mallea/local-surface-checks. This is a service check, separate from native UI verification. Deterministic coverage is in `npm test` / Windows `npm.cmd --script-shell=cmd.exe test`. No test-suite inference calls.

### Canvas library and authoring verification

Fabric.js **7.4.0**, MIT licensed, implements canvas annotation/export behind a small adapter. Install through the committed lockfile using `npm.cmd ci` (PowerShell) or `npm ci` (Bash/Zsh); no global Fabric install or native canvas package setup is required for browser/Tauri use. Stop Mallea previews before changing dependencies. [Surface contract and limits](docs/SURFACE_SDK.md).

Optional real-model service verification, same commands in PowerShell/Bash/Zsh:

```sh
# Development: two authoring jobs, maximum three attempts each, no production fallback.
node --env-file=.env --env-file=docs/private/smoke.env scripts/verify-surface.mjs
# Optional explicit direct Meta check; requires PROD_LLM_KEY, PROD_BASE_URL, PROD_MODEL.
node --env-file=.env scripts/verify-surface.mjs --production
```

Omit the optional smoke.env argument when DEV_MODEL is already in .env. Expected: initial/refinement ready with attempts, versions, timings and numeric usage, retained app data, then a total. Missing monetary usage is null. Failures stop without an automatic rerun. This uses a separate in-memory service, not the user's database, and does not prove native UI behavior. Windows verified; Linux/macOS execution untested. Do not run paid checks unless you intend to use the explicitly selected inference configuration.

### Probe requests beyond the walkthrough

See [the capability audit](docs/CAPABILITY_AUDIT.md) for supported surfaces, observed results, and limits. A passing package validator does not establish that every part of a natural-language request was fulfilled.

Run one selected probe at a time from the repository root (same commands in Windows PowerShell, Linux Bash, and macOS Zsh):

```sh
node --env-file=.env scripts/probe-capability.mjs layout
node --env-file=.env scripts/probe-capability.mjs computed
node --env-file=.env scripts/probe-capability.mjs threshold
```

Each command is a separate optional inference run: one generation plus at most two repairs, 4,096 output tokens per request, 60-second request timeout, development configuration only. Choose the case you want; do not run all three as a routine startup step. Add `--env-file=docs/private/smoke.env` after `--env-file=.env` if that is where your model selection lives. No production switch is supported.

The probe seeds the hand-authored reference into an in-memory store. It leaves the running app and its database untouched. Reports and generated packages go under ignored `.mallea/probes/`. Inspect the report's request, UI nodes, and critical/ordinary outcomes at revision gaps 0, 1, 2, 3, and 7. `ready` means package validation passed, not that the requested change was fulfilled. The separate `requestCheck` compares the result with expectations for the selected probe; a mismatch or generation failure exits nonzero. The threshold probe should currently return `unsupported`, with no draft. Linux/macOS commands remain untested.

After updating to the unsupported-response change, restart the service and refresh the browser; there is no new dependency or migration. In **Shape this app**, try “Only block critical tasks after three unseen revisions; warn before that.” Expected: **Not supported yet**, an explanation, and no installable draft. Existing installed state stays unchanged. For a supported non-default change, ask for a review label showing the computed number of revisions since acknowledgement. See the audit for the exact evaluated requests and limits.

The sections below cover optional inference tests, prerequisites, builds, isolation checks, and detailed run instructions. They are not prerequisites for trying the browser preview above.

### Verify development inference

This checks that local configuration can reach the development model before we build the agent loop. It sends one synthetic prompt, requests at most 512 output tokens (including any reasoning charged against that limit), times out after 60 seconds, and does not retry or use production credentials. A request can incur inference charges, including if a client timeout occurs.

#### Prerequisites

- Windows with PowerShell, or Linux/macOS with Bash or Zsh; Git installed.
- Node.js 24 installed from [the official Node.js site](https://nodejs.org/). Reopen your terminal after installation.
- An HTTPS endpoint supporting the chat-completions request format, a valid development key, and an accessible model identifier.

Verify installation (same commands in PowerShell, Bash, and Zsh):

```powershell
node --version
git --version
```

Initially tested on Windows with Node v24.19.0 and Git 2.55.0.windows.5. Linux and macOS instructions are provided but have not yet been executed on those platforms. This step requires no npm dependencies, Python, WSL, Rust, or desktop build tools.

| Platform | Shell | Inference smoke test |
| --- | --- | --- |
| Windows | PowerShell | Passed |
| Linux | Bash | Awaiting platform verification |
| macOS | Zsh or Bash | Awaiting platform verification |

These results apply only to the current inference script, not to future desktop builds.

#### Configure a fresh checkout

**Windows / PowerShell:** open a terminal at the repository root. Create the local configuration only if it does not already exist:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

**Linux / macOS / Bash or Zsh:** from the repository root, create the configuration without overwriting an existing file:

```sh
if [ ! -e .env ]; then cp .env.example .env; fi
chmod 600 .env
```

Open `.env` in your preferred text editor. For example, use `nano .env` if installed, or `open -e .env` on macOS. Keep the file as plain text.

Set `DEV_BASE_URL` to the API base URL (before `/chat/completions`), `DEV_API_KEY` to your key, and `DEV_MODEL` to an available model ID. The base URL must use HTTPS and contain no query string, fragment, or embedded credentials. Quote values if needed; do not paste configuration values into issue reports or commit them. Production variables are reserved for later validation and are ignored by this test.

Shell environment variables take precedence over values loaded from the file. Remove any stale exported development settings if they override the file unexpectedly. Do not use `source .env`; Node loads the configuration directly without executing it as shell code.

#### Run the test

The following commands are identical on Windows, Linux, and macOS; run from the repository root:

```powershell
node --env-file=.env scripts/smoke-inference.mjs
```

If model configuration is kept in a separate ignored local file, load it explicitly:

```powershell
node --env-file=.env --env-file=docs/private/smoke.env scripts/smoke-inference.mjs
```

That optional private file is not distributed with the repository. On a fresh machine, put `DEV_MODEL` in `.env` instead, or create your own private file containing that assignment. Later env files override earlier ones; shell variables still take precedence.

Success prints JSON with `status: "PASS"`, `expected_response_matched: true`, elapsed time, and available numeric usage fields. Exit code is zero. The test checks the model's answer against `MALLEA_OK`; it does not print raw responses, keys, endpoint URLs, or model identifiers. A successful check establishes basic connectivity and text generation, not tool calling or production compatibility.

#### Troubleshooting

- Missing configuration: fill the named variables locally and rerun.
- HTTP 401/403: check credentials and access permissions.
- HTTP 400/404: check the API base path, model ID, and request-format compatibility.
- HTTP 402/429: check available credit or rate limits; do not repeatedly retry.
- Network error or timeout: check connectivity and the configured endpoint. A timeout does not prove the remote request was cancelled.
- `FAIL` after HTTP success: the endpoint responded but did not produce the expected marker. Investigate response-format compatibility or output limits before adding retries.
- Node does not recognize `--env-file`: install the documented Node version and open a new terminal.
- Linux/macOS cannot find `node` or `git`: install the missing prerequisite for your OS and reopen the terminal. Verify both version commands before retrying.
- Linux/macOS file-not-found errors: check that you are in the repository root and match filename capitalization exactly.

Check secret-file exclusions before committing (same commands on all three platforms):

```powershell
git check-ignore .env docs/private/smoke.env
git status --short
```

### Verify a tool-call round trip

Use the same Node installation and development configuration as above. Commands are identical in PowerShell, Bash, and Zsh:

```sh
node --env-file=.env scripts/smoke-tools.mjs
```

For the optional local model configuration file:

```sh
node --env-file=.env --env-file=docs/private/smoke.env scripts/smoke-tools.mjs
```

This test performs at most two requests, each capped at 512 output tokens with a 60-second timeout. Development is the default; production requires the explicit flag documented below. There are no automatic retries or environment fallbacks. It uses synthetic data only and makes no application changes.

1. The model receives a read-observation tool schema and chooses whether to call it (`tool_choice: auto`).
2. Local code requires exactly one allowed tool call and validates its arguments before execution.
3. The local handler creates a synthetic observation result with a fresh random receipt.
4. The original assistant tool call and correlated tool result are sent back to the model.
5. The final JSON must exactly match the observation ID, revision, and receipt. The receipt was absent from the initial prompt, so success verifies use of the tool result.

Expected output: `status: "PASS"` and all four verification flags true, with two request usage records. Nonzero exit means failure. Tool names and arguments are never executed as arbitrary code. Raw responses, credentials, endpoint identity, and model identifiers are not printed.

Windows verification passed in 5.154 seconds with 1,416 total tokens across two requests. Linux/macOS remain untested. This is function calling through the configured API, not an MCP integration test, plugin execution test, or production validation.

If the model does not request a tool, the test fails without forcing a call or issuing a second request. Invalid arguments also stop execution. A non-JSON final response fails the strict result check. Check tool support, model configuration, and token limits before making another paid attempt; general HTTP troubleshooting above also applies.

### Explicit production compatibility check

This is a budget-consuming production compatibility check, not the default development command. Set `PROD_BASE_URL`, `PROD_LLM_KEY`, and `PROD_MODEL` locally. The production model used for the recorded check was `muse-spark-1.3`, confirmed by the existing Python example. Keep credentials outside source control.

Run in PowerShell, Bash, or Zsh:

```sh
node --env-file=.env scripts/smoke-tools.mjs --production
```

If your model ID is in the optional private file:

```sh
node --env-file=.env --env-file=docs/private/smoke.env scripts/smoke-tools.mjs --production
```

The shared helper accepts an API base URL or a complete `/responses` or `/chat/completions` URL, normalizing the path to `/chat/completions`. This behavior applies to the tool test and extension experiment; the original text-only smoke script still expects an API base URL.

Both stages use automatic tool selection. The tested production endpoint rejects `tool_choice: "none"`; final validation rejects additional calls rather than executing them. The full round trip passed on Windows in 4.613 seconds with 1,588 tokens. Production usage did not include a monetary cost. Linux/macOS remain untested. [Meta chat-completions documentation](https://dev.meta.ai/docs/protocols/chat-completions) describes the protocol; longer reasoning-preserving loops may require a Responses adapter later.

### Experimental extension generation

Use development configuration only. Run in PowerShell, Bash, or Zsh:

```sh
node --env-file=.env scripts/spike-extension.mjs
```

With optional private model configuration:

```sh
node --env-file=.env --env-file=docs/private/smoke.env scripts/spike-extension.mjs
```

One request, a 2,048-output-token cap, a 60-second timeout, no automatic retries. The prompt requests a small manifest and JavaScript module for an evidence-review status function. Host code validates exact manifest fields and permissions, then uses Node's syntax-check mode without executing the generated module. A unique artifact is written under ignored `.mallea/experiments/<timestamp>/package.json` for local inspection; it is a data envelope, not an npm installation manifest.

Expected result: `status: "PASS"`, `manifest_valid: true`, `syntax_valid: true`, `generated_code_executed: false`, and `behavior_verified: false`. This proves a structurally valid package can be generated, not that its code is safe or behaves correctly. No imports, side effects, or behavior are certified by a syntax check. Use the isolated verifier below rather than executing the artifact directly. The experimental contract is not yet the stable framework SDK.

Windows passed with 949 total tokens. A previous attempt exhausted its 1,024-token cap; a separate 2,048-cap request succeeded. Model output varies between runs. Linux/macOS await testing. Failed generation or validation exits nonzero and does not install any extension.

### Preparing for the application scaffold

The isolated behavior runner and shared app scaffold are now implemented. The prerequisite checks below are followed by install, test, and run instructions. Direct Meta's basic tool-call compatibility and the generated review function's six behavior cases have passed; the bounded browser authoring loop is implemented.

Use this repository directly; do not generate a separate project. The following checks prepare the host machine only.

#### Windows / PowerShell

Windows verification used Node 24.19.0, npm 11.17.0, Rust/Cargo 1.99.1, the stable MSVC toolchain, Visual Studio 2022 C++ Build Tools, and WebView2 155.0.4283.62. The Windows release executable compiles and actual native-window rendering, acknowledgement, observation editing, and browser event delivery are verified.

```powershell
node --version
npm.cmd --version
rustc --version
cargo --version
rustup show active-toolchain
```

On another Windows machine, install missing prerequisites following [Tauri's official prerequisite guide](https://v2.tauri.app/start/prerequisites/): C++ Build Tools with the Desktop development with C++ workload, WebView2, and Rust using the MSVC toolchain. Reopen the terminal afterward. Use `npm.cmd` if PowerShell blocks the npm script; no execution-policy change is needed.

#### macOS / Zsh or Bash

For desktop development, install Apple's command-line tools if missing:

```sh
xcode-select --install
```

Install Rust using [rustup](https://rustup.rs/) if absent, then open a new terminal. Verify:

```sh
xcode-select -p
node --version
npm --version
rustc --version
cargo --version
rustup show active-toolchain
```

#### Linux / Bash

For Debian/Ubuntu, install the desktop build libraries:

```sh
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

For other distributions, use the matching [official prerequisite instructions](https://v2.tauri.app/start/prerequisites/). Install Rust through rustup if absent and verify:

```sh
node --version
npm --version
rustc --version
cargo --version
pkg-config --modversion webkit2gtk-4.1
```

Use a graphical desktop session to test the desktop host. Both macOS and Linux setup paths await execution on those machines. Missing native libraries or linker errors should be resolved against the corresponding prerequisite guide before attempting full desktop builds.

### Install and verify the application

Run from the repository root with this project's development processes stopped. Dependencies are pinned in package.json and package-lock.json. Native dependencies are resolved in apps/desktop/src-tauri/Cargo.lock. Keep both lockfiles in version control. The project-local npm cache lives under ignored `.mallea/npm-cache`; it avoids reliance on a broken global cache and can be regenerated.

`npm ci` replaces the installed dependency tree. It is for initial installation, lockfile updates, or repairing an interrupted install, not something to run each time you open the app.

**Windows / PowerShell:**

```powershell
npm.cmd ci
npm.cmd --script-shell=cmd.exe test
npm.cmd --script-shell=cmd.exe run build
```

**Linux / macOS / Bash or Zsh:**

```sh
npm ci
npm test
npm run build
```

On Windows, the explicit command-shell option avoids a user-level npm setting that selects Git Bash. It applies to that command only; no global npm configuration or PowerShell execution policy is changed. The first install requires registry access. Tests and frontend builds make no model calls and require no `.env` file.

Expected: all automated tests passing, successful TypeScript checking, and frontend output under `apps/web/dist` and `apps/desktop/dist`. This frontend build does not compile Rust. Tests include real loopback HTTP requests, so an environment that blocks local network connections cannot run the service integration test.

### Execute a generated extension in isolation

Same command on every platform; replace the path with the artifact reported by your generation command:

```sh
node scripts/verify-extension.mjs .mallea/experiments/<timestamp>/package.json
```

The angle-bracket segment is a placeholder, not literal shell syntax. For a reproducible offline check without generating anything:

```sh
node scripts/verify-extension.mjs examples/reference-extension.json
```

The reference extension is hand-authored test data, not presented as model output. The previously generated local artifact was separately verified. Expected: `PASS` and six cases covering blocked, warning, clear, out-of-order revisions, and new evidence after acknowledgement.

The runner uses QuickJS compiled to WebAssembly inside a fresh worker. It exposes no host bindings or imports and projects only the required input fields. Limits: 8 MiB interpreter heap, 256 KiB interpreter stack, 100 ms execution deadline, two-second worker deadline. Every result is validated before use. These controls reduce access and runaway computation; they are not a guarantee against interpreter vulnerabilities. SDK 0.2 UI trees compile to escaped markup in a sandboxed iframe with an allowlisted message bridge. Arbitrary React and native commands are not supported.

### Existing-workspace migration and recovery

Older evidence-review databases are migrated transactionally on first startup, with a consistent SQLite backup alongside the original. Installed packages and acknowledgements are retained. See [migration details](docs/LEGACY_REVIEW.md#legacy-database-migration-details). No credential changes are required.

Stop the service before copying or restoring a database. Keep the backup and original database. For a fresh demo without modifying either, set `MALLEA_DB` to a new filename using the table above. To inspect a backup, choose that backup as `MALLEA_DB` in a separate stopped-service session. Starting the current service on an old backup performs a new migration. Restoring an old backup does not preserve later edits; do not overwrite current state casually.

After pulling this dependency update, stop this project's previews and run `npm.cmd ci` (Windows) or `npm ci` (Linux/macOS). Runtime versions are pinned: official `@modelcontextprotocol/sdk` 1.32.2, `ws` 8.22.0, and `zod` 4.6.7. The MCP maintenance-line API was selected after checking its [official server documentation](https://ts.sdk.modelcontextprotocol.io/server). Generated packages never install dependencies.

### Local routing and MCP verification

Current studio mode adds registered `read_saved_design` with `{targetAppId, arguments:{designId}}`, used by Parcel's manual saved-design refresh. Source read access is distinct from Surface-local permissions. SDK 0.3 Surfaces and limits are described in [SURFACE_SDK.md](docs/SURFACE_SDK.md). The evidence-specific details below describe the retained legacy path.

The automated suite makes real MCP discovery/tool calls over Streamable HTTP and tests outbound routing through a third synthetic instance. Run `npm.cmd --script-shell=cmd.exe test` / `npm test` from the repository root. No model calls or user workspace changes occur.

The gateway is available at `/mcp` on the same loopback service. A local registered instance supplies its process-local `X-Mallea-Session` header. `read_observation` takes `targetAppId` and `observationId`; calls enforce workspace, grants, links, and owner availability. Discovery grants no read access. The runtime uses the official SDK's linked in-memory transport for its service-local calls; external SDK clients use Streamable HTTP. The outward app connection is WebSocket, not an MCP event log.

App definitions live under `apps/definitions/`; service-side domain validators enforce their contracts. Legacy SDK 0.2 remains bounded to evidence panels and two policies. Do not expose this local registration/pairing model on a public interface. Revocation prevents subsequent reads/actions; it cannot erase information a caller already received.

Native generated frames now load from a short-lived service URL with an opaque sandbox origin and their own restrictive content policy. The frame receives no session token; task data arrives only over the validated parent bridge. The native host allows frames/connections only to the local service. This avoids inheriting the native host's inline-script policy through srcdoc.

### Browser authoring and compatibility

Use the [current walkthrough](#see-it-running) above or the separate [legacy review walkthrough](docs/LEGACY_REVIEW.md). The service is loopback-only, checks origins, and requires a process-local session token after bootstrap. This is a local development boundary, not production authentication. Never expose it on a public interface. Restarting invalidates sessions; connected apps automatically reconnect and refresh authoritative state.

SDK 0.2 supports a generated layout tree, a pure review function, two review policies, and one insertion slot. It is not unrestricted React generation. SDK 0.1 artifacts from the earlier command-line experiment remain verifiable with the isolated verifier but cannot be installed by this runtime. Runtime packages are authored through the builder; no manual file copying is necessary.

### Bounded real-model authoring validation

Use `verify-surface.mjs` for the current apps. For the legacy evidence-review flow, this service-level check remains available (same command on every platform):

```sh
node --env-file=.env scripts/verify-collaboration.mjs
```

It starts an isolated in-memory workspace on an ephemeral loopback port, registers board and notebook clients, opens an outbound simulated notebook connection, grants linked evidence access, and checks two real authoring jobs with an evidence edit between them. It does not open a native window or alter your running workspace. Native acceptance is the separate interactive walkthrough above.

Each job permits at most three model requests of 4,096 output tokens each, with a 60-second request timeout. Add the optional ignored model-selection env file as described above. For the explicit direct Meta check, append `--production`; production key/base/model configuration is required. No environment fallback occurs. Expected: two ready jobs and PASS; usage is printed without credentials. Failures exit nonzero and unavailable monetary usage is reported as null.

The older command below verifies the original standalone authoring path and remains useful for compatibility checks; it does not validate the new registry/MCP/event integration.

The following command makes two authoring jobs (initial and follow-up), each with at most three requests of up to 4,096 output tokens and a 60-second request timeout. It uses an in-memory workspace, verifies both policies, installs the revisions, checks retained acknowledgement, and prints only diagnostic/usage summaries. It does not change your running app's database. Failed generation exits nonzero. Cancellation stops client work but cannot guarantee the provider stops billing an already submitted request.

Same command in PowerShell, Bash, and Zsh:

```sh
node --env-file=.env scripts/verify-authoring.mjs
```

Add `--env-file=docs/private/smoke.env` immediately after `--env-file=.env` only if you use that optional local configuration. To explicitly validate direct Meta, configure `PROD_LLM_KEY`, `PROD_BASE_URL`, and `PROD_MODEL`, then run:

```sh
node --env-file=.env scripts/verify-authoring.mjs --production
```

For an entire interactive direct Meta session, append `--production` to the workspace-service command instead. Reserve it for explicit production checks. There is no automatic environment switch.

### Run the desktop scaffold

Keep the workspace service running. In another terminal, start the desktop frontend:

```powershell
# Windows / PowerShell
npm.cmd --script-shell=cmd.exe run dev:desktop-ui
```

```sh
# Linux / macOS
npm run dev:desktop-ui
```

Then launch the native shell in another terminal:

```powershell
# Windows / PowerShell
npm.cmd --script-shell=cmd.exe run desktop -- dev
```

```sh
# Linux / macOS
npm run desktop -- dev
```

The frontend uses port 5174 and opens Fieldnote by default; use the service's `--studio` option. First native compilation downloads Rust dependencies and takes longer. Ctrl+C stops each terminal's process. Preview Fieldnote at `http://127.0.0.1:5174`; this is not a native-shell test. The retained notebook frontend is available at `http://127.0.0.1:5174/?legacy` with the legacy service mode.

For a native release executable, first run the frontend build above, then:

```powershell
# Windows / PowerShell
npm.cmd --script-shell=cmd.exe run desktop -- build
```

```sh
# Linux / macOS
npm run desktop -- build
```

This stage builds an executable without packaging an installer. The workspace service remains a separate process; it is not bundled or auto-started. Build each platform on its own OS. Linux/macOS native builds remain unverified.

Windows output: `apps/desktop/src-tauri/target/release/mallea-desktop.exe`. With the service running, launch it from PowerShell:

```powershell
& .\apps\desktop\src-tauri\target\release\mallea-desktop.exe
```

Required desktop icons are committed alongside the original SVG. To regenerate them after an icon change (same command on every OS):

```sh
node node_modules/@tauri-apps/cli/tauri.js icon apps/desktop/icon.svg --output apps/desktop/src-tauri/icons
```

The generator also produces optional mobile/store assets, which are ignored because those targets are outside this scaffold's scope.

Troubleshooting: use the documented system prerequisites for missing linker/SDK/library errors. If ports 4318, 5173, or 5174 are occupied, stop the previous Mallea process instead of silently changing ports. If the UI reports a disconnected service, start the service first and reload. A failed artifact verification prevents service startup. Re-run `npm ci` if dependencies are missing; do not delete credential files to reset the app.

### Windows: EPERM while installing dependencies

An `EPERM` / `unlink` error involving a native `.node` file (for example the Rolldown binding) can mean a running preview has that file loaded. Windows cannot replace the loaded module.

1. Stop this repository's web preview, notebook preview, service, and desktop development commands with Ctrl+C in their terminals. If an agent started them in the background, ask it to stop those specific previews.
2. Once they have exited, retry from the repository root:

```powershell
npm.cmd ci
```

3. A failed install can leave dependencies partially removed, so complete the reinstall before restarting the app.
4. Start the service and desired frontend using the preview instructions above.

Do not kill all Node processes: other applications may use them. Administrator mode and deleting the lockfile are not the first fix for a loaded-module lock. If the error persists after the relevant processes exit, investigate the specific file's permissions or security-software lock before changing either.

## Reproduction documentation policy

Every significant new setup, build, run, migration, and verification step must be added here with parallel Windows PowerShell and Linux/macOS Bash/Zsh instructions, prerequisites, expected output, and troubleshooting. Shared commands may be documented once with their supported shells stated. Document OS-specific differences explicitly and distinguish supplied instructions from completed platform tests. Record OS, runtime version, command, and outcome when each platform is verified. Optional private configuration remains outside version control. The project plan uses immutable versions as described in the project guide; routine reproduction instructions and implementation status are maintained in place.
