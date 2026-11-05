# I001: installable Mallea runtime

Authorized November 4, 2026; advances post-hackathon installable delivery, extending E1/E3/E5. Active plan: PROJECT_PLAN.v026.md. Development branch: codex/installable-runtime; main protected through November 9 inclusive.

## Bounded units

| Unit | Scope | Acceptance |
| --- | --- | --- |
| I1 | Versioned installed-runtime/host boundary | Core takes explicit installed host/resource paths; app definitions and data do not depend on Tauri. Developer defaults remain. |
| I2 | Packaged Core and private Node 24 runtime | Allowlisted distribution runs outside checkout with no external Node, secrets, private configuration or source paths. |
| I3 | Native launcher and Core lifecycle | Shortcut launches dashboard; authenticated readiness, bounded startup, duplicate-start handling, actionable recovery; apps survive dashboard closure. |
| I4 | Installed dashboard and model setup | Fieldnote/Parcel open independently; creator denied in Core and disabled through Surface; user enters HTTPS endpoint, registered Meta identity and session key; LLM requests gated before execution. |
| I5 | Windows installer and verification | Per-user installer, runtime prerequisite handling, restart/upgrade/data retention; clean-machine and native evidence distinguished. |
| I6 | Mandatory macOS follow-up | App bundle/runtime paths, packaging, independent windows, persistence, model setup and upgrade checks on macOS before any feature work beyond this slice. |

## Contract and boundaries

- Installed host provides its executable and resource root to a local supervisor; Core launches that host with app-scoped private identity files. Core does not import Tauri APIs.
- The distribution contains runtime.json (format/version/runtime requirements), private Node, allowlisted Core/SDK/runner/app definition code and runtime dependencies. No .env, developer home, database, credentials or source project is copied.
- Installed user state is in a per-user application-data directory separate from developer .mallea. Resources are read-only; migrations operate only on user data. No automatic migration of developer data.
- Current local single-user trust limits remain. No claim of hostile-app isolation. Existing model keys stay in Core memory; session keys must be re-entered after Core restarts. No new persistent secret storage in this slice.
- OS-owned error dialogs may report bootstrap failures before the Surface renderer is available. All running app/framework UI remains Surface-owned.
- Dashboard closure is not Core shutdown. Core is a detached local process. An explicit exit/recovery path and bounded diagnostics must be provided without stopping unrelated processes.

## Exclusions and release gates

No installed new-app creation, third app, marketplace installation, remote transport, Linux delivery, custom native extensions, host rewrite or changes to the developer app creation workflow. No paid inference required for packaging checks. Signing/notarization require actual configured identities; do not imply unsigned artifacts are signed. macOS execution cannot be certified from Windows.

Baseline: historical November 2 evidence is 80 tests/macOS native build; fresh November 4 focused checks initially cannot start because node_modules is absent. Locked install and fresh baseline required before implementation verification.

## User acceptance (pending)

On a machine without developer tools: install; open Mallea twice; expect one Core and a usable dashboard. Open Fieldnote and Parcel, edit/save artwork and feedback, close dashboard; expect apps still work. Reopen dashboard, restart Mallea and expect retained data. With no model key, expect a clear settings requirement and no inference request. Enter user configuration/key, then try Shape; verify preview/install and key absence from app data/logs. Installed Create app is unavailable even through a direct Core request. Reinstall/upgrade and expect unchanged data. Uninstall should retain user data. Repeat on macOS after Windows acceptance.

Automated/agent-operated evidence and user feedback must be recorded separately in STATUS.md. README must distinguish source setup from installer availability and platform limits.
