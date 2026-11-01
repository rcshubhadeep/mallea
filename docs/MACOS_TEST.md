# macOS acceptance pass

Run this after the Windows acceptance steps in [REHEARSAL_E004.md](REHEARSAL_E004.md). macOS execution is not yet verified. Linux testing can wait. Required Mac fixes come before the next delivery/video slice.

## Build and open

1. Get the latest committed source into a separate Mac checkout. Do not copy Windows node_modules, compiled executables or private host credentials. Use Node 24, Rust and the [Tauri macOS prerequisites](https://v2.tauri.app/start/prerequisites/), including Xcode command-line tools. Use tools for the Mac’s own architecture.
2. From the repository root, run:

   ```sh
   node --version
   npm ci
   npm run build
   npm run desktop -- build
   ```

   Expect Node v24 and a completed native build. First builds can download dependencies and take minutes. Do not run the test suite concurrently with compilation.
3. Create ignored `.env` configuration locally. Development uses `DEV_BASE_URL`, `DEV_MODEL`, `DEV_API_KEY`; the key may instead be entered for the current Core session in Model settings. Only registered Meta model identities are accepted. Optional explicit demo configuration uses `PROD_BASE_URL`, `PROD_MODEL`, `PROD_LLM_KEY`. No key values belong in source, app definitions or generated projects. Do not assume an ignored configuration file from Windows exists on the Mac.
4. In one terminal, start Core and leave it running:

   ```sh
   node --env-file=.env scripts/engine.mjs
   ```

5. In another terminal, open the dashboard:

   ```sh
   node scripts/launch-app.mjs mallea-core
   ```

   Use its Open app buttons for Fieldnote/Parcel. Closing the dashboard must leave their windows and Core running.

## Test and report

Run `node --test --test-concurrency=1 tests/*.test.mjs` after compilation. Then follow the native tests in [REHEARSAL_E004.md](REHEARSAL_E004.md): blank-project folder selection/build, Shape composition, Muse transformation, owner-approved cross-app copy, revocation, pause and restart. Check secondary-click context menus using a mouse right-click or the Mac’s configured secondary-click gesture; Windows modifier shortcuts are not Mac instructions.

Use a fresh small test app. Dynamic apps/Surfaces/data are stored in the ignored local Core database and were not pushed with Git. Recreating a small test app on the Mac avoids migrating Windows-local project paths or identities. For a generated project copied intentionally as source, rebuild and register it against the Mac Core using its own README; never copy its private host credential. A fresh registration does not import the old Core’s data automatically.

Record Mac model/architecture, macOS version, Node/Rust versions, the failing command or UI step, expected versus actual behavior and any safe error output. Do not include `.env` contents, API keys or private host configuration. Return failures before proceeding to video/delivery work; a successful compile alone is not native acceptance.
