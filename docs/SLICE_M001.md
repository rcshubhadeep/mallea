# M001: one Core model and stock icons

November 16 user direction, before the next A2UI-inspired PR. Advances E2/E3 shared authoring and E5 reproducibility. Branch: codex/single-core-model.

## Numbered units and acceptance

| Unit | Scope | Acceptance |
| --- | --- | --- |
| M1 | One provider-neutral Core model | Dashboard exposes endpoint, exact model ID, authoring mode and session key. Shape and model Automations use that configuration. No development/production profiles, provider allowlist, hidden fallback or separate image model. Source optionally reads MALLEA_BASE_URL, MALLEA_API_KEY and MALLEA_MODEL. Installed Core starts unconfigured. Endpoint/model changes require a supplied key; keys remain excluded from public state, app data and subprocesses. |
| M2 | Stock icons and data compatibility | Choose deterministically from bundled icons without model requests. Existing custom image files remain readable. Existing saved semantic Automation records remain executable through a legacy processor-ID reader; new definitions use the neutral model ID. Preserve app definitions/data. |
| M3 | Verification and handoff | Focused baseline, settings/inference/Automation/icon compatibility regression, full suite, TypeScript and frontend builds. Review README and active guidance. Record basic user acceptance separately from automated checks. |

## Exclusions and limits

No image inference adapter or capability probing, environment/key migration, dependency replacement, live paid inference, new ecosystem feature or platform packaging. Stock icons are used even if a text provider also offers images. Old DEV_/PROD_ environment settings are ignored; enter Core settings or use the MALLEA_ names. The developer-export --dev flag changes exports only, never the selected model. Already-running authoring jobs retain their originally selected model; subsequent jobs/runs use the current Core configuration. macOS/native checks remain deferred.

## User test

1. Close Mallea windows and stop existing Core. From the repository root run `node scripts/mallea.mjs` on Windows PowerShell or Linux/macOS Bash/Zsh; existing prerequisites remain in README. Expect a build and dashboard launch.
2. Open Model settings. Expect endpoint, exact model ID, authoring mode and session key, with no profile selector. Enter your provider configuration and apply. Expect Shape to use that model; there is no fallback if it rejects a request.
3. Make a small Shape proposal and explicitly approve it. Run a semantic Automation, if one is configured. Expect both to use the same Core model. Deterministic Automations still run locally.
4. Change endpoint or model without entering a key. Expect rejection and the prior configuration retained. Supply the key explicitly to change configuration.
5. In the source edition, create a blank app. Expect a stock dashboard icon without an image-model request. Existing saved custom icons and app data remain visible. Installed creation remains unavailable until the planned ecosystem work.
6. Restart Core. Dashboard-entered credentials must be re-entered; optional source MALLEA_ environment settings reload. Ordinary app use remains available without a model.

User feedback so far: basic launch/use works on the prior merged build. This does not establish native acceptance of M001, every A001 clarification case or macOS behavior. Fresh automated evidence is tracked in STATUS.md.
