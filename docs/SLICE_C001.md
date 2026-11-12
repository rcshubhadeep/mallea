# C001: Core authoring hardening

Authorized November 6, 2026 on `codex/core-authoring-hardening`, branched directly from main. Advances E2 Surface contracts and E3 shared model access. This parallel Core slice explicitly supersedes the hackathon Meta-only catalogue restriction; installer/macOS integration remains on its own branch. External-app access stays parked.

| Unit | Acceptance |
| --- | --- |
| C1 | Add-independent mode preserves existing definitions, state and placement; scoped edits cannot extend shared models. Core checks policy again when installing. App-wide editing requires an explicit mode. |
| C2 | Trusted dashboard accepts an HTTPS Chat Completions endpoint, exact model ID and session key without a model allowlist. Existing environment profiles remain usable; keys never enter authoring context or app records. |
| C3 | Live authoring uses bounded API/Surface/model lookup, draft edit, validation and completion tools. Tools operate on a pinned draft only. Preview, explicit approval, cancellation and stale-revision rejection remain mandatory. Basic JSON authoring is an explicitly selected compatibility mode. |
| C4 | Focused adversarial tests, complete regression suite, type/build checks, README review and exact user handoff. Distinguish mocked protocol checks from real model/native checks. |

Limits: no external-app integration, host rewrite, installer changes, arbitrary execution/network tools, credential persistence, automatic provider/model fallback or bulk paid evaluations. No claim that every compatible endpoint supports tool calling. Existing app-wide editing and legacy SDK authoring remain available. New source behavior requires rebuilding source apps and later integration into the installer branch.

Baseline: 25/25 focused author/live/dashboard tests passed on the new branch before edits. Main is protected through November 9 inclusive; no merge is authorized.

C1-C4 source implementation and automated/browser acceptance completed; fresh suite 90/90, TypeScript and both frontend builds passed. Native/real-provider/user acceptance remains pending as recorded in REHEARSAL_C001.md. README reviewed/updated. No installer integration, main merge or paid inference performed.
