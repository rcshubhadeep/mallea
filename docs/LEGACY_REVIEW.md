# Legacy evidence-review walkthrough

Historical Slices 001-002. Start the service without --studio and open http://127.0.0.1:5173/?legacy and http://127.0.0.1:5174/?legacy. Current native release opens Fieldnote; use the notebook browser frontend for the old walkthrough. Native review UI verification in earlier evidence refers to the earlier executable.

## See it running

The current prototype lets you create and revise a review panel inside the running app. The model writes its layout and behavior; you preview it, approve its access, and install it without restarting. Installed versions and acknowledgements survive reload and service restart.

You need Node.js 24 and this checkout. Run commands from the repository root. Install dependencies once with `npm.cmd ci` (Windows PowerShell) or `npm ci` (Linux/macOS). Skip installation when dependencies are already present. Stop this project's previews before reinstalling dependencies.

**Terminal 1 — start authoring (same command in PowerShell, Bash, or Zsh):**

Configure the development key, HTTPS API base, and model identifier in your ignored `.env`: `DEV_API_KEY`, `DEV_BASE_URL`, `DEV_MODEL`. Keep credentials server-side. See [Developer Setup](../README.md#developer-setup) for detailed prerequisites and configuration.

```sh
node --env-file=.env services/workspace/server.mjs
```

If model selection is already in the optional ignored `docs/private/smoke.env`, use this command instead:

```sh
node --env-file=.env --env-file=docs/private/smoke.env services/workspace/server.mjs
```

**Terminal 2 — start the browser app:**

| Windows / PowerShell | Linux / macOS |
| --- | --- |
| `npm.cmd --script-shell=cmd.exe run dev:web` | `npm run dev:web` |

Open **[the production board](http://127.0.0.1:5173)**. Stop each server with Ctrl+C when finished.

**Terminal 3 — run the notebook:**

For the actual Windows desktop, build once using the commands under Developer Setup and launch:

```powershell
& .\apps\desktop\src-tauri\target\release\mallea-desktop.exe
```

For desktop development on Windows, Linux, or macOS, start the notebook frontend (`npm.cmd --script-shell=cmd.exe run dev:desktop-ui` / `npm run dev:desktop-ui`) and launch the native shell in another terminal (`npm.cmd --script-shell=cmd.exe run desktop -- dev` / `npm run desktop -- dev`). Linux/macOS native interaction remains unverified. Opening port 5174 in a browser is a frontend preview, not a native test.

1. Keep the notebook and browser board open. They have distinct identities and own different data.
2. In the board, click **Allow linked notebook evidence**. Discovery shows availability; this explicit action grants access to the board's linked observations. The notebook must be connected for cross-app reads.
3. Click **Shape this app** and use the suggested request, or edit it. The model receives the app contract, linked source IDs, and descriptions discovered through MCP. Evidence contents are bound at runtime.
4. Click **Create panel**. Generation has at most three attempts; inference can incur charges. A request outside the contract may return **Not supported yet**, with no draft. There is no automatic production fallback.
5. Try the preview acknowledgement: preview becomes clear while the live task stays unreviewed. Approve the displayed access, then **Install panel**. Installation applies only to this app.
6. Acknowledge evidence in the installed board panel. In the native notebook, edit the observation text and click **Save observation**. The notebook revision increases; the board updates without reloading and requires review of the new revision.
7. Use **Refine this panel** to request: “Only block release-critical tasks when evidence changes; warn for the others. Keep the screenshot and acknowledgement button. Use the heading Release confidence.” Preview and install; the ordinary unreviewed task warns while prior acknowledgements remain.
8. Close/reopen the notebook. The board reports an offline evidence owner, then refreshes authoritative evidence when it reconnects. Reload or restart the service: packages, grants, revisions, and acknowledgements persist. The app reconnects automatically; refreshing manually is also supported.
9. Run the automated tests under Developer Setup to reproduce denied access, wrong-instance/cross-workspace calls, third-instance routing isolation, duplicate edits, stale acknowledgements, failed updates, and preview isolation without paid model calls.

The built-in demo uses local synthetic screenshots and observations. Evidence reads use the official MCP SDK gateway; app presence, routed requests, and revision notifications use outbound WebSocket connections. The service remains a local development workspace, not a production identity service.

**No model configuration yet?** Start with `node services/workspace/server.mjs examples/reference-extension.json` instead. This seeds a hand-authored reference panel into an empty workspace; it does not demonstrate model authoring. Starting without a package or configuration shows an empty app, but generation requires configuration.

Data is stored in ignored `.mallea/workspace.sqlite`. For a fresh walkthrough, stop the service and choose a new database filename before restarting; keep the old file to retain its state:

| Windows / PowerShell | Linux / macOS |
| --- | --- |
| `$env:MALLEA_DB='.mallea/my-walkthrough.sqlite'` | `export MALLEA_DB='.mallea/my-walkthrough.sqlite'` |

Use a filename not previously used. On an existing migrated workspace, your installed panel appears on the board after source access is allowed; use Refine this panel rather than Create panel. Seeding a reference package never replaces an existing installed version. Do not delete credential files to reset the app.

### See the notebook too

Keep the service running. In another terminal:

| Windows / PowerShell | Linux / macOS |
| --- | --- |
| `npm.cmd --script-shell=cmd.exe run dev:desktop-ui` | `npm run dev:desktop-ui` |

Open **[the notebook frontend](http://127.0.0.1:5174)**. This previews the desktop app's frontend in a browser. To launch its native window, complete [desktop prerequisites](../README.md#preparing-for-the-application-scaffold), leave that frontend running, then use another terminal:

| Windows / PowerShell | Linux / macOS |
| --- | --- |
| `npm.cmd --script-shell=cmd.exe run desktop -- dev` | `npm run desktop -- dev` |

### What works today

- Browser and notebook frontends share a React runtime and a local workspace service.
- Model-authored layout and review behavior can be previewed, installed, and revised inside the running browser app.
- Acknowledgements and installed versions persist in SQLite; preview data is separate.
- Twenty-one automated checks and both frontend builds pass on Windows. Direct Meta initial/revision validation passed on the first attempt for each job.
- Unsupported requests can return an explanation and suggested alternative without creating a draft. The capability audit records demonstrated support and limitations; model-assisted detection is not guaranteed for every request.
- Windows native rendering, isolated acknowledgement, and native-to-browser evidence edits pass. Linux/macOS execution awaits verification.

The notebook owns observations and revisions; the board owns linked tasks and acknowledgements. Each app has separate package activation. The shared builder consumes app-provided definitions and MCP discovery; authorized evidence reads are routed to the connected owner. Generated UI rendering and acknowledgement have been verified in the actual Windows native window.

### Where this is going

The approved next PoC is a **desktop visual scratchpad** and a differently styled **local web asset-review board**. Muse Observer will propose a working color-control Surface; builder will create a publishing Automation and feedback Surface connecting both directions. These are planned, not available in the legacy walkthrough above. See [demo plan](DEMO_PLAN.md), [foundation plan](FOUNDATION_PLAN.md) and [slices](SLICES.md).

Runnable source delivery is required alongside the video, with Windows/macOS/Linux setup, simple local startup, labelled real-artifact keyless try mode and actual platform evidence. Native installers may reuse Tauri tooling; signed installer parity is optional. Reuse libraries where supported APIs fit behind small adapters; Mallea keeps its own application model and capability contract.

The target framework supplies **one default agent: the Observer**. It notices permitted app-usage patterns, suggests a useful shortcut, view, or agent, and sends an accepted suggestion into the builder. Its activity is controllable; suggestions do not install changes automatically. **The Observer is not implemented yet.**

Every app also includes the **agent-builder capability**. It creates user-specific agents and changes the app's structure, data/action bindings, behavior, layout, and appearance within a published vocabulary. It is not a second preinstalled resident agent. Today the builder authors bounded review packages; live app-model composition and runnable user-created agents remain planned.

Future trusted connector adapters can expose classic-app data/actions for use in Mallea views and agents, under explicit access. No classic-app connector is currently implemented. Spreadsheet/current-month-folder shortcuts and word-processor summary panels are illustrative examples of the vision, not apps included in this MVP. See [the foundation](FOUNDATION.md) for the distinction between working features and the target model.

Apps communicate through data, state updates, events, and permitted actions. Each app renders its own interface from that information. Transferring or embedding another app's visual components or view tree is out of scope; shared framework components and screenshots carried as data are separate concepts.

See the [project plan](README.md) and [implementation status](STATUS.md).



## Legacy database migration details

The first Slice 002 startup migrates a Slice 001 database transactionally. Before migration, SQLite writes a consistent backup alongside it named `<database>.pre-slice002-<timestamp>.sqlite`. The board retains its package versions, drafts, and acknowledgements; observations become notebook-owned records. The notebook starts with no installed panel. No credential changes are required.
