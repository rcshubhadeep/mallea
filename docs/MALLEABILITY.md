# Malleability: current contract and acceptance gate

Implementation reference for the predecessor runtime. Current product direction and unimplemented engine contracts are governed by PROJECT_PLAN.v019.md; this reference does not establish their acceptance.

Active plan: PROJECT_PLAN.v018.md. Malleable software is the current priority. Observer and additional agent features wait for ordinary app changes to work reliably; two-way permitted data paths remain part of the foundation.

## Why the editing path changed

The user requested bold saved-version text without changing layout. The previous Surface grammar lacked font weight, so refusal was technically honest but exposed an inadequate authoring surface. Extending one property alone would still leave every small edit dependent on regenerating a complete app. The new path makes the change itself a first-class bounded proposal against stable element IDs.

Nodes, bindings, registered actions and local state form the persistent app model. Built-in and generated interfaces share the renderer/validator. A model proposes set/insert/move/remove operations; a pure copied-model transform preserves unmentioned elements. The resolved model then uses the existing validated preview/version/install path. No new code interpreter, arbitrary CSS engine or second plugin architecture.

## Evidence by category

| Category | Implemented scope | Current evidence / remaining gap |
| --- | --- | --- |
| Ordinary appearance | Weight, size, italic, alignment, decoration, line spacing, colors and bounded borders/spacing | Exact bold-list request passes development and direct-Meta service checks with no unrelated model changes. Actual native visual check recorded in STATUS.md when complete; not implied by service success. Other typography properties have bounds validation, not a full visual matrix. |
| Independent addition | Insert a normal node/layout/control and declare local text/color state | Deterministic composition/state tests pass. Prior real-model note additions passed; fresh-model targeted insertion is a remaining gate. |
| Movement/removal | Address existing IDs; move within/between layouts or remove a node; required components remain | Deterministic preservation/cycle/root/target checks pass. Multiple real-user compositions and per-contribution selection UI remain incomplete. |
| Working behavior | Existing typed bindings, choices/literal arguments and registered app/service actions | Annotation/save/review and both data directions verified in 003C-A. No arbitrary expressions or invented operations. |
| Persistence | Existing app-version activation and local field storage | Install/state/stale-version tests pass. Removing UI retains stored local values; no destructive data-delete UI. |

Passing one request does not complete the gate. Require real-user confirmation across appearance, additions, rearrangement and working data/actions before Observer. Keep exact failures and request mismatches visible. Do not expand the vocabulary by adding a new high-level demo recipe for each prompt.

## What this is not yet

No independent contribution/package manager, direct element selection, undo UI, arbitrary app generation from an empty window, general computed expressions, production identity or canvas-internal rewriting. A generated edit still activates a version of the composed workspace. Existing stored full SDK 0.3 artifacts remain compatible; new authoring requires targeted proposals. Trusted canvas changes use declared app actions rather than arbitrary model code.

See SURFACE_SDK.md for exact grammar/limits, SLICE_003C.md for work units and root README for reproducible run/test instructions. User acceptance is recorded separately from automated/agent-operated verification.
