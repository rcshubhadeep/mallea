# Three-minute demo: software that adapts where you work

State: approved scenario, planned implementation. Governed by PROJECT_PLAN.v012.md and FOUNDATION_PLAN.md. Exact timings must be rehearsed. Scratchpad and Review Board are working app labels, not a naming exercise.

## Promise

Two visibly different apps Powered by Mallea. The desktop helps a designer annotate an image and keep a note. The local browser app helps a team review saved assets. Muse reasons about a repeated inconvenience, authors an improvement, and helps the user create contributions that connect the apps. The payoff is less navigation and less copying between tools.

## Starting scene and data

- Desktop: canvas-centric, compact toolbar, warm/dark creative-tool treatment; bundled synthetic image, one editable text annotation and accompanying note. Annotation color lives behind Edit initially. Fixed shell/canvas are normal trusted app code.
- Web: a light asset-card/review layout with its own brand/navigation and feedback area. It initially holds an older saved version of the same design and a clearly linked asset identity.
- Use a striking visible annotation/color/text difference between the two saved versions. No copyrighted/private customer material, clipboard secrets, or external services are needed.
- Start from a documented fresh demo dataset, no generated final Surfaces/Automation installed. Both runtimes and companion are connected; inference explicitly uses the target Meta configuration for the recorded acceptance run.

## Storyboard (180-second ceiling)

| Time | Visible action | Proof |
| --- | --- | --- |
| 0:00-0:15 | Show desktop and browser, different designs, same linked asset at different saved revisions. State the friction in one sentence. | Two apps, one framework; recognizable work |
| 0:15-0:35 | Make actual annotation-color changes through Edit several times. Show the Observer's concise Muse-backed suggestion to keep that control beside the canvas. | Observation based on real permitted interaction, model reasoning |
| 0:35-1:00 | Accept into builder, preview, install. Use the new color Surface immediately; make one brief placement/appearance refinement if timing permits. | Software changes at point of use; working model-authored controls |
| 1:00-1:35 | Save a new image/note revision. In web builder request the publishing Automation, inspect its link/access, preview and install; reopen the web app. | User-created executable contribution, app-load trigger, desktop-to-web data |
| 1:35-2:10 | Web updates to saved image/note and shows source revision/receipt. Add review feedback. In desktop builder request feedback beside the canvas, preview and install; the comment appears. | Useful effect in both directions; direct builder Surface |
| 2:10-2:35 | Use the resulting workspace: edit color, save, rerun/reopen web to show newer published revision; feedback remains. Briefly show installed entries/disable access if time allows. | Persistent capabilities operating together; repeated use without repeated generation |
| 2:35-3:00 | Reload/reopen proves installed contributions persist. Finish with one compact architecture/model credit and runnable-project pointer. | Durable local customization, meaningful Meta role, PoC limits |

These are editing budgets, not promises of model latency. Transparently label shortened generation waits. If three full authoring sequences exceed 180 seconds, show short request/preview/result excerpts from the actual run, preserving proof of all three; put full run evidence in the repository. Do not replace them with hand-authored final screens or claim edited/replayed generation is live.

## Requests and outcomes

Observer request comes from a real model suggestion informed by repeated Edit -> Annotation color events and registered capabilities. Expected intent: make annotation color easier to reach. The exact text/layout is not scripted or matched to an intent enum.

Direct web request example:

> When I open this board, check the linked scratchpad design. If it has a newer saved revision, update this asset's image and note. Keep the feedback and tell me which revision was published.

Desktop request example:

> Show feedback from this image's linked review card beside my canvas. Keep my editing controls available.

Supported variation to verify off-camera: a different placement/grouping/label within the same vocabulary, with unchanged data and working bindings. A small layout vocabulary is acceptable; selecting fixed complete workflows from prompt keywords is not.

## Model participation

Muse supplies Observer reasoning and builder authoring/refinement; record actual model IDs and usage from the run. Installed color controls, permitted action execution, revision comparison, and triggers run deterministically unless explicitly defined otherwise. The video should make that distinction legible without becoming an implementation lecture.

## Acceptance walk-through (target for completed build)

1. Follow the final README's fresh-demo start instructions. Open the actual desktop plus local web app; verify different visual identities. Existing README currently runs the legacy evidence demo until the corresponding slices land.
2. Enable Observer, repeat the real color-edit flow, and accept its suggestion. Preview must leave live data untouched. Install and change annotation color through the new control.
3. Save revision with an accompanying note. Link the board asset and approve the specific access. Author/install the web-load Automation. Reopen the board: the new image/note/source revision appear exactly once with a receipt.
4. Reopen again without a new save: no duplicate published revision. Make an unsaved desktop edit: web does not publish it. Save and run/reopen: new saved revision appears.
5. Add browser feedback. Author/install the desktop feedback Surface: comment appears without transferring the web app's UI. Reload: both contributions remain.
6. Deny/revoke access or close source app: show understandable unavailable status, no unauthorized update. Restore/reconnect: refresh current data. Disable Automation: reopening makes no new update.
7. Try labelled saved-artifact mode without credentials, then configured live mode with a fresh supported request. Save separate Windows/macOS/Linux results; browser-only desktop preview is not native verification.

These steps describe future acceptance, not working behavior today. Each slice supplies exact implemented labels/commands in README at handoff.

## Judging evidence supplied by the user

Stage One is pass/fail for theme fit, viability and reasonable use of Meta Model API and/or Meta open-weight models. Preserve real target-Meta Observer reasoning and builder authoring evidence, a working end-to-end run and an explanation of theme relevance. Theme/track details and complete submission requirements still need confirmation; eligibility is not guaranteed by this plan.

Stage Two scores each criterion from 0-10. The user supplied the missing rubric as an image; weights and evaluation intent are recorded below. Stage Three advances the top five projects per track to live video viewing/ranking using the same rubric. Prioritize a self-contained video; do not assume judges inspect the repository to understand it. Scores and finalist odds remain unknown.

| Criterion | Weight | Rubric intent (paraphrased) | Evidence in this demo |
| --- | --- | --- | --- |
| Impact | 30% | Real-world potential, beneficiaries, significance, likelihood of use and fit to a listed problem statement | A designer reduces repeated menu navigation and manual image/note transfer, while feedback stays beside the work. Show a connected workflow, not only a relocated color control. State the broader framework benefit briefly; confirm actual problem-statement/track fit separately. |
| Use of Meta AI Tooling | 25% | Creative substantive use beyond basic integration; surprising capabilities | Muse reasons from real usage patterns, then authors/refines a working Surface and executable Automation from capabilities. Show actual model request/preview/result. A deterministic repetition gate must not masquerade as the Observer brain. |
| Technical Depth & Execution | 20% | Sound engineering, refinement, thoughtful design and craft | Both apps use shared composition and permission mechanisms; preview does not mutate live data; installed definitions persist; saved revisions publish once; feedback survives. Demonstrate results briefly instead of explaining plumbing. Runnable instructions and focused evidence support inspection. |
| Demo | 25% | Working, impressive product that holds up live and a compelling video | Distinct polished apps, clear before/after, immediate working controls, publishing and returned feedback, reload proof within 180 seconds. Measure rehearsal, label compressed waits and retain actual run evidence. |

This mapping changes presentation emphasis, not feature scope: impact is the largest category, and Meta tooling plus demo together are 50%. Do not add infrastructure or more models to chase technical-depth points. Measure a real repeated workflow if using a time/click comparison; do not invent productivity savings. Before submission confirm the exact listed problem statement and track, which were not included with the rubric.

Current competitive assessment: plausible contender if the complete authored-transformation/automation/feedback loop works and is clear in three minutes. Main presentation risk is appearing to reveal prebuilt controls or merely synchronize two apps. Show real request/preview/result, useful working behavior, persistence and distinct apps. This is an assessment, not official scoring guidance or evidence of finalist odds.

## Cuts and delivery

No public hosting, multi-user login, version conflict UI, production sync, full design editor, background agent service, certificate setup, or installer infrastructure project. No demo segment solely to tour the ledger. One concise receipt is enough. Keep keyless saved-artifact try mode and a documented source-run path; signed installers on every platform are optional.

Prepare a real-run backup recording, three-minute edited video, submission text, model/usage evidence, known limits, and runnable instructions. Freeze November 1 evening; November 2-3 are rehearsal/recording/delivery days. Submission target: November 4 morning ET; exact hour remains unknown.
