# Core authoring and app ecosystem delivery

Accepted direction: November 13, 2026. Active plan: [PROJECT_PLAN.v029.md](PROJECT_PLAN.v029.md). This is planned work, not implemented behavior. Current evidence belongs in STATUS.md. The A2UI ideas inform Mallea's existing Surface architecture; adopting A2UI's wire protocol or replacing the renderer is not required.

## Goal and sequence

Improve authoring, establish portable reviewed app distribution, remove demo-specific coupling from the default product, and prove a two-way Windows/macOS publishing loop using installed Mallea. The user accepts GitHub-authenticated contribution for the first version, independent app/Core updates, the five ecosystem PRs and the initial portable-app proof.

1. Deliver A1-A7 below, with a measured outcome for the compact-authoring experiment rather than a requirement to adopt a new grammar.
2. Deliver M1-M5 below. GitHub supplies repository/review/download infrastructure; no operated marketplace service in this stage.
3. Retire Fieldnote/Parcel from the default bundle/catalogue after generic package installation and independent launch work. Remove demo-ID branching from generic paths where it blocks this proof. Keep domain regression fixtures and preserve existing user data. Explicitly de-bundle/deprecate rather than silently deleting installed apps.
4. Research useful showcase apps and select at least three. Write concrete workflows and required capabilities before implementation; no names or domains are committed by this roadmap.
5. Add only the element/model/action definitions needed by the accepted workflows, through bounded follow-up PRs. They remain generic declared capabilities, usable by authoring and validation; no app-specific bypasses.
6. Build at least three apps through Mallea, publish them through the review pipeline and install their released packages.
7. Install Mallea on a different Mac and exercise those packages, scoped/global Surface edits, deterministic and actual configured-model Automations, permissions, restart persistence and updates. Record exact runtime/package/contract versions and agent-operated versus user evidence.
8. On that Mac create a fourth app, publish it using only installed Mallea and the required browser sign-in/approval, then install its accepted release on the original Windows machine and verify it. Also verify local installation on the publishing Mac. No terminal, source checkout, manual JSON editing, Rust or npm for the creator/consumer flow. Maintainer review remains an explicit separate step; publishing does not self-approve or merge.

The Mac stage covers actual packaging, launch, runtime/host, persistence and authoring acceptance. Signing/notarization and clean-machine distribution remain separately evidenced requirements; a successful local Mac run does not prove them. Earlier Mac deferral remains in force until this scheduled stage. WebRTC, external-app integrations, payment, ratings and a hosted submission service remain outside scope.

## A: A2UI-inspired Core PRs

These labels are work IDs, not assigned GitHub PR numbers. Each starts from the latest accepted main, carries a bounded slice/test handoff and is reviewed before the next dependent PR.

| ID | Deliverable and milestone | Acceptance and limits |
| --- | --- | --- |
| A1 | Interactive Shape clarification; E2/E3 authoring | A bounded temporary system-owned question Surface pauses/resumes one pinned job. Validate answers in Core; retain original scope/configuration and budgets. Cancel, expiry, restart and stale definitions cannot install or revive work. Preview/approval still required. Detailed slice: SLICE_A001.md. |
| A2 | Progressive validated draft previews; E2 authoring | Publish bounded validated snapshots after completed tool operations, using the existing tool loop first. Installed state stays unchanged; partial output cannot install; cancellation/stale/late updates are rejected. No provider-token-streaming prerequisite. |
| A3 | Action invocation policy; E2/E4 contracts | Declare permitted user/agent/Automation callers and direct-user-gesture requirements. Core enforces policy with existing app/Surface grants; deny unknown callers and prevent migrations from widening access. No arbitrary execution framework. |
| A4 | Accessibility contracts; E2 renderer | Schema/renderer labels, descriptions, validation associations and live announcements; Windows keyboard/focus/accessibility checks with explicit platform limits. Mac checks join the later rehearsal. |
| A5 | Expandable compositions; E2 blank creation | One generic collection-editor composition expands into ordinary editable models/elements/actions. Preserve independent-add policy, inspectability and persistence. No opaque whole-app primitive or fixed finished-app recipe. |
| A6 | Compact authoring experiment; E3 model access | Fixed bounded tasks compare current tools with compact signatures for correctness, preservation, token use and latency. No hidden mode/provider fallback, bulk paid evaluation or mandatory new DSL. Report evidence even if no format is adopted. |
| A7 | Host capability negotiation; E1/E2 compatibility | Advertise versioned components/actions/contracts; authoring/install refuse incompatible hosts clearly. Preserve old generated apps and reject forged capability claims at the owner boundary. This supplies M2's compatibility foundation, not remote transport. |

## M: GitHub-backed app ecosystem PRs

App packages and Core source/releases are separate modules and version streams, initially in the same public repository. Adding an accepted app does not require a new Core executable. Packages contain manifests, definitions, schemas/clean defaults, declared required capabilities, assets and optionally disabled Automation templates. They contain no copied renderer, credentials, local instance IDs, grants, private paths or current personal data. Review exported defaults/assets too; schema-valid content can still disclose personal information.

| ID | Deliverable and milestone | Acceptance and limits |
| --- | --- | --- |
| M1 | Portable app packages and generic host launch; E1/E2/E3 | Export/import one generic app to a fresh identity and clean data store; independent native window reuses the shared host. Establish installed blank creation/authoring without developer tools, replacing the original installed-creation denial only through this reviewed path. Existing source projects and saved data remain supported. Reject undeclared adapters/dependencies rather than packaging arbitrary source. |
| M2 | Versioned compatibility and PR validation; E2/E5 | One validator is reusable locally and by GitHub Actions. Publication checks package requirements against supported contracts/publisher policy; CI repeats independently; receiving Core checks again. Preserve released contract versions and test unsupported, malformed and incomplete packages. Old publisher version alone is not rejection unless the explicit minimum-publisher policy requires an update. |
| M3 | Publish through Mallea; E3/E5 | Exact public-file preview, GitHub user sign-in, fork/branch/package PR, cancellation and status. A non-coder submits without Git/source tooling; reject unrelated repository path changes and prevent duplicate retry submissions. GitHub credentials remain in trusted Core/native storage, separate from model credentials. PR creation is explicit; no automatic merge. |
| M4 | Catalogue/reviewed release/install; E1/E3/E5 | Trusted post-merge publication produces versioned verified packages and a cached catalogue. A new reviewed app appears without a Core release; offline cache works; user installs only the chosen compatible app. Fresh identity, required permission review, disabled imported Automations and integrity checks. Metadata refresh does not install code or grant access. |
| M5 | App updates and separate Core updater; E1/E5 | Independent versions, signed Core updates, app integrity, compatibility/permission changes, safe restart and rollback/recovery. Preserve data, local Surface customizations and package provenance; require an explicit resolution for conflicting customizations. No git pull or source rebuild on consumers. Cache checks on launch without blocking existing app use offline. |

## GitHub Actions as the reviewer's starting point

M2 adds a required validation result for app-package PRs and appropriate regression checks for source PRs. Each report identifies the exact reviewed head and validator/policy version, and includes:

- Package identity/version/author/license, changed files, sizes and assets.
- Contract/runtime/capability compatibility and undeclared dependency failures.
- Permission/action/Automation-template changes relative to the published version.
- Exported data/defaults review hints, secret/path checks with their detection limits, and provenance.
- Deterministic clean-install/restart/round-trip results, plus sanitized preview artifacts where supported. A screenshot is presentation evidence, not proof of safe behavior.
- Clear failures, warnings and remaining human review items; no model-generated approval claim.

Untrusted package PRs are data inputs. Use a trusted validator and bounded isolated checks with no model credentials, signing/release secrets, privileged tokens or execution of submitted app scripts. Do not check out or execute PR-controlled code under a privileged pull_request_target workflow. Pin external actions, give jobs minimum permissions and escape report content. Release signing/publishing runs separately from the reviewed trusted branch. Green checks assist human review; they never merge or grant app access automatically.

## Future contribution without a personal GitHub account

First version requires GitHub credentials for contributors; reading/installing public packages need not. Later a Mallea-operated submission gateway could accept another authenticated identity, retain author provenance/consent and submit via a GitHub App/bot. That introduces hosting, abuse/rate controls, account recovery and moderation work, and is explicitly deferred. A maintainer-assisted exported-package submission is another manual option. Direct GitHub PRs still require some GitHub identity; no common maintainer token/private app key ships in Mallea.

## Initial proof and final acceptance

Before scaling the catalogue, one small app must travel from creation/export through PR/review/release to clean installation with no Core rebuild. Then the full proof records three independently useful apps and the fourth-app Mac-to-Windows return path. For each capture package/version/hash, contract/Core versions, publication PR/release, clean initial state, post-install edits, restart, permissions/revocation, deterministic Automation and a genuine bounded model transformation with explicit provider selection. Grant/rebind on the receiving machine; never import another machine's authority or live visual tree.

Basic JSON/tool compatibility, stale-output rejection, cancellation, offline launch, update failure/recovery and private-data exclusion remain acceptance requirements. No successful flow is inferred from unit tests or mocked model output. No paid inference until a concrete bounded rehearsal is ready and the intended development/provider configuration is selected.

## Sources informing this plan

- A2UI 1.0 concepts: https://a2ui.org/concepts/inference-formats/ and https://a2ui.org/concepts/actions-and-functions/.
- GitHub PR API: https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request.
- GitHub Actions trust boundaries: https://docs.github.com/en/actions/reference/security/secure-use.
- Tauri static update metadata and signing: https://v2.tauri.app/plugin/updater/.

Documentation acceptance: preserve previous numbered-plan bytes/hashes, update active index and record the dated decision. README reviewed: no current run/setup behavior changes from this roadmap; planned behavior must not be presented as working.
