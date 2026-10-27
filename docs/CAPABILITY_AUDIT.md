# Capability audit after Slice 001

State: complete. This is a bounded follow-up assessment, not the start of Slice 002.

## Purpose and work units

Map what the accepted authoring flow can do beyond the suggested prompt. Advance the Day 2 variation gate and inform Days 3-7 without claiming a general application generator.

1. A1: inspect the contract, runner, builder, active plan, and current state; rerun baseline tests.
2. A2: run individually selected development probes for layout, computed labels, and an unsupported threshold policy. Inspect artifacts and behavior against the request, not merely the validator result.
3. A3: record demonstrated limits and decide whether a small improvement belongs now or in Slice 002.
4. A4: write Slice 002 with work units, acceptance checks, and exclusions tied to the three-minute demonstration.

No edits to the user's workspace/database. Probes start from the hand-authored critical-only reference in separate in-memory stores; generated drafts are not installed in the live app. Each explicit probe permits one generation plus at most two repairs, using the existing development configuration. No automatic batch, production fallback, or reliability percentage.

## Baseline

- User confirms the planned Slice 001 flow worked.
- Fresh verification: 17 tests and TypeScript checking passed.
- The layout contract allows eleven HTML element types, seven data bindings, constrained static styles, and one action (acknowledge current evidence).
- Review behavior sees only criticality, acknowledged revision, and evidence revision. It cannot inspect screenshot pixels, observation prose, other tasks, the network, or the filesystem.
- Two allowed policies: block all unreviewed tasks; or block critical tasks and warn for ordinary tasks. The six behavior cases enforce those policies. Label text can be computed from the projected inputs.
- Every panel must include screenshot, observation text, and review label. A text-only panel is currently rejected even though it may be a reasonable user request.
- Before this audit, the builder had no explicit unsupported-request result. A valid package can still fail to satisfy the user's request. The fix and remaining limits are described below.

## Results

All probes were individually selected and run on Windows against development inference. They used the same authoring service/validator as the app, isolated stores, real generated packages, and the bounded behavior runner. No new visual/browser or native verification is claimed for these probes. Layout evidence is artifact structure and successful compilation; interaction/persistence evidence comes from Slice 001.

| Probe | Requested result | Observed result | Judgment |
| --- | --- | --- | --- |
| Layout | Heading Evidence desk; task title, review summary, and action before screenshot/text; pale green background | Correct heading, bindings in requested content order, action, and #eef4e8 style in generated tree. Existing policy preserved at ten probed inputs. | Supported, first attempt. The heading precedes the bound task title; title is first among the requested data fields. |
| Computed label | Display the computed count of revisions since acknowledgement | Generated function returns 0, 1, 2, 3, and 7 revisions to review at those gaps for both criticalities. Heading changed as requested. | Supported, first attempt. This is newly authored executable label computation, not a static label swap. |
| Threshold, before fix | Warn for a critical gap of 1 or 2; block starting at 3 | Returned ready on attempt 1, but source retained critical-only and blocked gaps 1 and 2. | Request NOT fulfilled despite passing package validation. |
| Same threshold, after fix | Same request | Returned unsupported on attempt 1 with a specific explanation and a supported alternative. No draft created. | Honest handling of this observed unsupported request; threshold remains unavailable. |
| Computed label, after fix | Same supported computation | Still generated correct heading/labels and status at all ten inputs, first attempt. | Supported behavior did not regress in this probe. |

These are five observations, not a statistical reliability benchmark. Model responses vary. The existing six-case validator is a bounded behavior check against declared policies, not a proof of natural-language fulfillment or equivalence over every possible input.

### Resource evidence

| Run | Local report | Reported total tokens | Reported cost | Wall time |
| --- | --- | --- | --- | --- |
| Layout | .mallea/probes/1793113149218-layout/report.json | 2,756 | 0.008944 | 11.6 s |
| Computed, before fix | .mallea/probes/1793113219830-computed/report.json | 3,626 | 0.0126055 | 8.3 s |
| Threshold, before fix | .mallea/probes/1793113253920-threshold/report.json | 2,933 | 0.00969925 | 22.1 s |
| Threshold, after fix | .mallea/probes/1793113324277-threshold/report.json | 2,193 | 0.00617625 | 4.6 s |
| Computed, after fix | .mallea/probes/1793113413907-computed/report.json | 4,334 | 0.0152365 | 39.7 s |

Total: 15,842 reported tokens, reported cost 0.0526615. Costs are returned usage fields, not a billing reconciliation. No repairs or direct Meta calls occurred in this audit. Reports/packages are ignored local evidence; the table is the portable record. Wall time includes local setup and validation, not just provider generation.

## What users can change today

| Surface | Current extent | Evidence |
| --- | --- | --- |
| Layout | Reorder and group allowed nodes, choose headings and static styles within one task-details panel | Real layout probe plus earlier browser rendering |
| Copy | Titles, button labels, explanatory text, computed review labels | Actual generated artifacts and ten-case computed-label probe |
| Data display | Task title, reviewed revision, observation text/revision/screenshot, review status/label | SDK binding allowlist; live bindings tested in Slice 001 |
| Review decisions | Block all stale tasks, or block critical and warn for ordinary tasks | Real initial/follow-up runs; cannot choose arbitrary rules |
| Action | Acknowledge the currently displayed evidence revision | Browser and service tests; no custom action definitions |
| State/lifecycle | Preview copy; immutable installed versions; follow-up; retained acknowledgements | Slice 001 acceptance and restart tests |

Localizing copy, varying whitespace, or changing button wording fits the schema but was not separately evaluated here. Do not label untested examples as proven capabilities.

## What is outside today's contract

- No threshold/warn-only/time-based status rules, despite the JavaScript interpreter itself being able to compute them. The present policy contract and tests constrain them.
- No text-only panel: screenshot, observation, and review label are mandatory.
- No forms, editable plugin fields, arbitrary action buttons, extra persistent plugin state, or multiple panel slots.
- No filtering/aggregating all tasks: each behavior invocation receives only one task's criticality and two revision numbers.
- No screenshot analysis or prose interpretation inside the installed handler: pixels and text are not passed to it. Displaying evidence is different from understanding it.
- No conditional layout/style expressions or general React components. The UI tree is declarative; only the bounded host script performs bindings/actions.
- No real cross-app discovery, external tools, arbitrary dependencies/network, or background agent scheduling.

The runtime mechanics are reusable, but authoring is currently specialized to evidence-review panels. The domain-specific prompt, bindings, and policy validator still live in shared code. This is the architectural limit to address next.

## Small improvement implemented now

The model can return a schema-validated unsupported response with reason and alternative. The service treats it as terminal, performs no repairs for a valid refusal, and saves no draft. The builder displays Not supported yet; there is no install control or automatic acceptance of the alternative. A user must edit the request to pursue it.

The revised prompt explicitly forbids silently substituting a supported rule for an essential unsupported requirement. Deterministic tests cover retained installed state/acknowledgements and rejection of mixed/malformed responses. Nineteen tests and both frontend builds pass.

This is model-assisted feasibility assessment, not guaranteed semantic rejection. A model can still choose a supported package incorrectly. Request-specific expectations and user-visible preview remain necessary. The new refusal UI compiles; the live model/service result and deterministic tests are verified, while the user's browser check and direct Meta verification of this new response form remain pending. Direct Meta validation belongs in the next completed slice's bounded gate.

## How to try it

Restart the workspace service to load the new authoring prompt/response handler; refresh the browser. No dependency reinstall or database reset is needed. Use the existing README startup commands.

1. Ask: Keep the current policy. Show the number of revisions since acknowledgement in the review label, and name the heading Revision distance. Preview, then decide whether to install. Acknowledge or simulate evidence to see the count change.
2. Ask: Only block critical tasks after three unseen revisions; warn before that. Expected: Not supported yet, with an explanation and alternative; no installable draft and no change to the installed version.
3. To reproduce without changing the app, use the individually selected commands in README's capability-probe section. The script now reports a request-specific check and exits nonzero for a generated package that mismatches the selected probe. Earlier retained reports predate that reporting addition; their raw nodes/outcomes establish the judgments above.

## Follow-on decision and milestone report

- Milestone advanced: Day 2 variation/validation honesty; evidence for Day 3 shared contracts and Day 6 capability-aware authoring.
- Acceptance passed: genuinely different layout and computed code; unsupported-rule failure exposed and the same case handled honestly after the fix; no installed state changed; supported computation still passes.
- Incomplete: broader behavioral semantics, arbitrary apps, native verification, cross-app integration, and model-independent request interpretation.
- Next: implement the planned Slice 002 cross-app contracts and evidence flow. Move domain validation/context into app definitions and let the builder consume discovered capabilities.
- A configurable revision-gap threshold is the next bounded behavior expansion candidate after Slice 002 passes. It needs a parameterized contract and independent boundary-case expectations, not removal of correctness checks. It is not implemented or silently included in Slice 002.
