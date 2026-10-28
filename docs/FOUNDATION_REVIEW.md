# Foundation review: hosted web apps and local desktop collaboration

Historical review input. Subsequent user replies explicitly defer hosted-site connectivity, base-app upgrades and broad infrastructure. PROJECT_PLAN.v012.md and FOUNDATION_PLAN.md now govern; the hosted-site-first recommendation below is not the active sequence.

Status: reviewed proposal, before the next foundation snapshot and implementation. The user's expanded direction is recorded here; recommendations below are not claims of implemented features. Active plan remains v011 until the foundation revision incorporates the reviewed decisions. Demo app selection is explicitly pending discussion with the user.

## Product intent

Mallea explores an application framework designed for humans and LLM-powered agents as native participants. Existing tools such as MCP, bounded agent loops, and tool use belong in the framework's primitives. Apps expose an inspectable live model and can be adapted during use, without each developer building a separate agent product. The long-term ambition is an OS built around these principles; the PoC runs on current operating systems and browser hosts.

The historical product comparisons express ambition, not evidence of comparable novelty or success. The demonstration should establish a concrete difference: changes to useful software while using it, coupled to permitted actions across applications.

## User requirements from the expanded brief

- A hosted web app Powered by Mallea can communicate with desktop apps Powered by Mallea through a locally running broker and protocol. The web app need not be served by that local broker.
- The broker supports discovery, permission checks, and routing for more than a hardcoded pair of apps. Discovery does not grant access.
- Apps exchange typed data, state, events, and permitted action requests/results. Writes are restricted owner-executed operations. Running visual components and view trees do not cross app boundaries.
- Each app includes the builder and the Observer as the only predefined agent. Users can create additional executable agents.
- The Observer tracks permitted per-app interactions locally, proposes useful changes, and opens the normal build/preview/feedback/install flow after user acceptance. Installed automations and surfaces persist across restarts and reloads.
- A web customization belongs to the user machine and app identity and becomes active when that app is open. Desktop customizations follow the same lifecycle principle.
- Begin data identity/provenance with text and images. Keep a simple local ledger of exchanges, participating apps, and relevant data identities and versions. State identity requires a bounded definition.
- First settle the foundation, then discuss the two demo apps, write the demo plan, define bounded slices and numbered work units, and implement. Existing notebook/board apps are evidence and reusable adapters, not an irrevocable demo choice.

## Technical brief read and qualifications

Read the shared brief, Connecting Web Apps to Local WebSockets: https://share.gemini.google/BbGMpbX13a1x . It describes HTTPS-hosted web pages connecting to a loopback companion using WebSockets, origin validation, CSP, and browser-specific network restrictions.

The companion architecture fits Mallea. Its compatibility table is not acceptance evidence. Treat an actual hosted HTTPS page connecting to the local broker as an early feasibility gate on a named browser/version. Also test denied permission, absent companion, rejected origin, and reconnect. Localhost Vite success does not establish hosted-site success.

Chrome's official documentation describes Local Network Access replacing the earlier Private Network Access preflight effort and a version-dependent rollout across request types. Do not rely on the brief's PNA advice or universal loopback exemption. Browser rules must be tested rather than bypassed. Source: https://developer.chrome.com/blog/local-network-access .

Do not distribute one shared TLS private key or require users to weaken browser security. Start with one verified browser path; certificate/extension alternatives and other browsers are later compatibility decisions if the initial path fails.

## Recommended foundation decisions

### 1. A local companion with an explicit hosted-web adapter

Use one local companion process for the PoC, containing discovery, grants, routing, local customizations, credentials, and a small SQLite ledger. Preserve MCP for capability exposure/calls and WebSocket for app connections/events. MCP alone does not provide pairing, app identity, discovery, or a provenance ledger.

Pin a broker endpoint as configuration; do not scan ports or build P2P discovery. Pair a web origin and app identity through explicit local approval, then issue a scoped session. Validate origin and host, and enforce app/capability/entity grants on every operation. Origin identifies a website, not a user account: the PoC must declare its single-user/local-profile boundary rather than claim account isolation.

The current loopback development bootstrap must not become a way for every website to obtain credentials. A successful browser network-permission prompt is also not permission to read another app's data. These are distinct gates. Revoke or narrow access without rewriting the app.

### 2. Stable resource identity plus immutable content versions

Use a stable opaque resource ID for a logical item and a separate SHA-256 digest for each content version. Equal text in two different notes may have the same digest but different identities. Editing changes the digest while the note identity remains stable. Identical hashes alone cannot establish who changed anything.

Start with explicit text/plain and image media types. Hash a specified UTF-8 text representation and the exact stored image bytes; record the representation/version rule. Defer perceptual image hashing, automatic deduplication, universal IDs for every scalar, and semantic equivalence.

Use revision numbers for stale-write checks. An update names the expected revision and must be executed by the owning app's registered action. No generic permission to write an arbitrary database field.

For state, initially version only deliberately exposed JSON state resources with a documented deterministic serialization. Transient hover, focus, and every keystroke do not need global identities or ledger entries.

### 3. A small exchange ledger

Use ordinary SQLite records, with no blockchain or distributed consensus. Record operation ID, timestamp, authenticated requesting app/session, owning app, capability, resource IDs, content version references, outcome, and a related operation ID where useful. An owner-executed write records before/after versions and whether the actor was a user action or a named user agent when known.

Record metadata rather than duplicating private payloads in the ledger. Hashes can still reveal equality and must remain access-controlled. Keep ledger inspection local and scoped. The ledger explains broker-observed exchanges and owner-reported changes; it cannot discover edits outside those instrumented paths or independently prove a human identity. Reject/failed outcomes must be distinguishable from completed actions.

Keep commit and action-result logging consistent where local transactions permit it. Use operation IDs to deduplicate retries and represent an uncertain outcome honestly after a disconnect; do not claim exactly-once execution across crashes.

### 4. Local observation and explicit inference disclosure

Collect only allowlisted semantic interactions locally and per app, with opt-in controls, bounded retention, cooldown, and dismissal. Prefer local deterministic aggregation to sending raw event traces. No OS-wide monitoring, training, or RL is implied.

Local collection and local inference are different promises. With hosted Meta inference, a minimal approved pattern summary and capability context leave the device. Disclose this before enabling model-backed suggestions. Fully local inference is a future adapter, not a PoC dependency or present claim.

The Observer proposes; the user accepts an editable request, previews the result, gives feedback, and explicitly installs. It uses the same builder and permission system as a direct user request. It never needs a special route around validation.

### 5. Local persistent customization, app-scoped activation

Keep installed app-model changes, automations, user agents, and compatible extension state in the local companion, namespaced by app identity and paired web origin. A hosted web bundle loads its user's approved customization from that companion. This supports the requirement without a separate browser extension or a second competing persistence system.

The website still delivers its own base app and may keep its own domain data on its server. Local customization storage does not imply all application data is local, or that same-origin website code cannot see rendered data.

Activate app-scoped automations only while that app has an active authenticated connection; cancel/dismiss pending runs on disconnect, with no new external writes dispatched for a closed app. Already committed actions cannot be undone by closing a tab. An inactive or background tab is not reliably equivalent to a closed tab: define active as a connected runtime for the PoC, with a visibility pause if required, and test that boundary.

Persist compatible customizations across reconnect/reload. On incompatible base-app schema changes, suspend the affected customization and show a recoverable status rather than execute stale bindings. Do not promise cloud sync, cross-profile portability, or background web agents.

## Foundation contract and code implications

The minimum shared contracts are app identity/session; registered resource/action/event schemas; stable resource/version references; app-to-app grants; versioned live app model; user-created agent definition and bounded execution; local usage-event summary; installed customization lifecycle; and exchange ledger entries.

Keep the vocabulary small and composable: text, images, inputs, buttons, repeated data, a few layouts, typed bindings, registered actions, and an explicit agent trigger. No fixed menu of finished workflows. App adapters own business rules and authoritative writes. Each receiving app builds its own UI from received data.

Reusable current code: bounded inference adapter/repair loop, package validation and isolated execution, preview/install persistence, local registry/session/ticket machinery, MCP gateway, outbound sockets, and native/browser shells.

Required revisions: the review-slot/field/policy-specific SDK and host rendering; hardcoded observation capability routing; hosted-origin pairing and configurable broker connection; local customization activation semantics; text/image version envelopes and exchange ledger; runnable created-agent definitions; and the actual Observer. Preserve old data through an explicit compatibility/migration path. Do not present these as already implemented.

## Sequence after this review

1. Incorporate the clarified decisions into the next immutable project-plan snapshot and revise FOUNDATION.md, architecture guidance, progress review, README feature boundaries, and standing instructions. Preserve all historical snapshot bytes. Replace superseded next-slice proposals explicitly.
2. Write a final foundation plan with contract boundaries, unsupported behavior, migration, acceptance gates, and a time budget protecting the final two days.
3. Discuss and choose the two apps with the user. Then write a three-minute demo plan proving Observer -> authoring -> visible transformation -> permitted effects in both directions -> provenance -> reload persistence. Keep a minimal created-agent execution moment if it fits; avoid turning the video into a feature inventory.
4. Define implementation slices with numbered work units and milestone acceptance. First de-risk the hosted-HTTPS-to-local connection, then build the shared live-model/contracts, provenance and local lifecycle, authoring/user agents/Observer, and chosen-app integration in demonstrable increments. Precise grouping follows foundation/demo choices.
5. Implement and verify each slice, update README, record actual Meta use, and measure the final native/browser rehearsal. No fresh model calls were needed for this review.

## Baseline evidence for this review

Inspected the active v011 plan, foundation/status, proposed Slice 003, runtime connection adapter, registry/routing, HTTP operations, package scripts, and README. Existing code is still a bounded review/evidence implementation, not this complete foundation.

Fresh verification: 21 tests passed with loopback access; TypeScript checking passed on Windows. The first restricted run had 18 passes and three local HTTP EACCES failures; the permitted rerun passed all 21. No dependency replacements, inference calls, or runtime modifications. Hosted HTTPS pairing, generic app models, ledger, Observer, and created-agent execution remain incomplete. Existing prior native-build/UI evidence is historical, not repeated here.
