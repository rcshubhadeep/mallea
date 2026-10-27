# Slice 001: change the running app through conversation

State: complete for the bounded browser acceptance surface; user confirms the planned flow worked. Evidence is recorded in STATUS.md. Subsequent capability probes are recorded separately in CAPABILITY_AUDIT.md.

## Goal and plan alignment

Overarching goal: users change software at the point of use, with Meta-powered authoring creating persistent interface and behavior. The full demo also requires desktop/web collaboration and a proactive observer; this slice builds the authoring path those features depend on.

Primary milestone: complete the Day 2 generation/validation/preview/install/revision loop in PROJECT_PLAN.v004.md. Implements a bounded portion of sections 6-8 and advances Days 3, 6, and 7 through state storage and the builder. It does not complete those later milestones, their full agent lifecycle, or the cross-app workflow.

## Verified starting point

- Source inspection confirms the builder is a placeholder, review state lives in React memory, and the service loads one extension at startup.
- Existing inference generation is a standalone script; it is not connected to the running app.
- Eight automated tests and TypeScript checking passed again before this slice was planned.
- The user confirmed the documented service and browser startup commands work.
- Earlier evidence includes a successful Windows executable build and direct Meta tool-call validation. Neither was rerun for planning this slice.

## Work units

| Unit | Work | Acceptance evidence |
| --- | --- | --- |
| W1 | Define the versioned authoring contract: manifest, generated UI and behavior, allowed app actions/resources, fixture inputs, and state ownership. Replace the single hardcoded-version experiment with a bounded real package contract. | Validate both an initial package and a revision; reject unsupported permissions and malformed packages. Keep app data separate from package code. Tests reflect the requested behavior rather than forcing every extension to use the current reference rule. |
| W2 | Implement package/state storage and activation: drafts, validated versions, active package pointer, review acknowledgements, and minimal installation metadata. | Reload and service restart retain state; rejected drafts cannot replace the active package; installation is atomic. Preview data is separate from live app state. |
| W3 | Add a service-side authoring flow using the shared inference interface and app contract. Include actual validation diagnostics, cancellation, and at most two repair attempts. Restrict access to inference routes and keep keys server-side. | A natural-language request produces a genuinely model-authored UI/behavior package; bounded repair uses real errors; invalid generation stops without activation or unbounded cost. |
| W4 | Build the isolated UI preview and bounded host bridge. Compile only allowed dependencies; reuse the behavior runner. | Generated interface renders; permitted actions work; undeclared data/actions, host access, and direct native access are rejected. Preview does not modify live state. |
| W5 | Replace the shared builder placeholder with request, progress, preview, requested access, and explicit installation controls. Connect the installed package to the app slot. | User creates and installs a visible capability in the running browser app without manual file copying or server restart. Shared builder entry point remains available to both hosts. |
| W6 | Add follow-up revision with retained app state and failed-update recovery. | A second request changes UI or behavior, creates a new package version, preserves acknowledgements, and leaves the previous version active if validation fails. |
| W7 | Run the full scenario, a small request variation, failure checks, reload/service restart checks, and one bounded direct Meta milestone validation. Update README and status. | Recorded evidence for each slice acceptance condition, exact Windows and Linux/macOS instructions, and clear platform test status. Report direct Meta failure explicitly if it prevents the acceptance gate. |

## User acceptance walkthrough at handoff

Exact commands and expected results are now in the root README under See it running. The walkthrough is:

1. Start with a board that has local evidence fixtures but no preinstalled generated review panel.
2. Open Shape this app and request an evidence panel showing the screenshot/observation and an acknowledgement action. Ask it to block tasks with unreviewed evidence.
3. Inspect the generated preview and requested access, then install it. The new interface appears without restarting the app.
4. Acknowledge one task and retain that state.
5. Ask: Only block release-critical tasks when evidence changes; show a warning for the others.
6. Preview and install the revision. Verify the changed behavior on an unreviewed ordinary task and confirm the previous acknowledgement remains.
7. Reload the page, then restart the service. The active package and acknowledgement still exist.
8. Verify a rejected/failed update leaves the working version usable, using a documented deterministic test fixture rather than relying on the model to fail randomly.

## Boundaries and completion report

Use local synthetic evidence and the browser as the primary acceptance surface. Do not present local evidence as cross-app exchange. Native interaction, MCP discovery, synchronization, proactive suggestions, full agent scheduling/history, broad app generation, and final video polish remain later work. No additional infrastructure beyond that needed for this authoring flow.

The slice is complete only when the authoring/revision/persistence walkthrough and its checks pass. Report separately: milestone advanced, acceptance conditions passed with evidence, remaining incomplete work, and the user's exact test steps. If blocked, leave the slice incomplete and identify the unmet condition.
