# Slice 004: Observer and feedback returning to desktop

Historical plan: superseded by the October 30 desktop-engine rebase. Follow docs/README.md and PROJECT_PLAN.v019.md; do not resume this execution sequence.

State: defined, not started. Milestone M2; depends on accepted 003C targeted composition and feedback return. Follow active plan, FOUNDATION_PLAN.md and DEMO_PLAN.md. Review status/source/goal and verify baseline before starting. Feedback adapters now belong to 003C; this slice adds Observer and verifies the combined bidirectional, malleable workflow.

| Unit | Work | Acceptance |
| --- | --- | --- |
| W1 | Opt-in per-app semantic events using existing action hooks, bounded buffer and repetition/cost gate; common Observer/builder entry points in both apps. | Disabled means no collection/inference; real repeated Edit/color interaction detectable without fabricated history. No OS monitoring/telemetry subsystem. |
| W2 | Genuine model-backed Observer reasoning over minimal event summary and capabilities; no-suggestion outcome, dismissal/cooldown/cancellation. | Relevant suggestion from repeated real interactions, no one-off trigger, unsupported capabilities rejected and late cancelled result discarded. Meta is reasoning component; deterministic gate only limits calls. Disclose summary transmission. |
| W3 | Accepted suggestion enters same editable builder/preview/install flow. Persist contribution purpose/access/enabled/latest outcome. | Observer-origin Surface changes working color/layout and persists. Suggestion acceptance neither installs nor grants access automatically. No second resident default agent. |
| W4 | Reuse 003C web feedback read/add and desktop feedback contribution; verify they coexist with an Observer-origin addition. | New browser comment appears beside canvas through approved capability; independent local rendering. Offline/denied handled; domain rules in adapters. Image update and Observer-origin changes retain feedback. |
| W5 | Actual native/browser verification, variations/restart and focused Meta milestone validation after development success; README and user handoff. | Color transformation, saved image desktop-to-web and feedback web-to-desktop pass. Record model/usage/timing, platform evidence and deterministic vs inference roles. |

User handoff: exact README commands, enable Observer, repeat real menu/color workflow, accept/preview/install/use/refine; add web comment, ask for desktop feedback Surface and verify persistence. Disable observation and confirm no new model requests; revoke feedback access and confirm no unauthorized data. Record user feedback separately.

Excluded: publishing-on-load (005), behavioral analytics framework, background agents, cross-app UI transfer, hosted-site support and scheduling. Report M2/passed/incomplete; M3-M4 remain incomplete. Mandatory end-of-slice README review/update.
