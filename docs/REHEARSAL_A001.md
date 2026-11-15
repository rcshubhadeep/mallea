# Interactive Shape clarification checks

November 14, 2026. Advances E2/E3 authoring. Source branch: codex/shape-clarification, stacked on documentation PR #4. Scope and exclusions: SLICE_A001.md. No progressive previews, marketplace, provider fallback or A2UI dependency added.

## Fresh automated and browser evidence

- Focused baseline before edits: 23/23 Core/installed/dashboard/launcher checks. New clarification tests: 8/8. Full sequential suite: 101/101. TypeScript and both frontend production builds passed; existing large-bundle advisory remains.
- Contract tests reject duplicate/unknown questions or answers, invalid choices, unbounded text, unsupported fields, wrong/replayed batch IDs and invalid question counts. The model supplies bounded question data; Core supplies fixed ordinary Surface elements and actions.
- Lifecycle tests cover pinned scope/configuration, explicit answer submission, cumulative model/error/time budgets, separate waiting expiry, per-app serialization, cancellation, late results, stale definitions, close/restart and owner-disconnect grace. Answers cannot install or widen scope.
- Authenticated HTTP checks cover wrong-app inspection/submission, POST-only answer/cancel mutations, inspectable system/session ownership, no persistent question records, no answer text in stored draft metadata, and normal explicit install approval after continuation.
- Synthetic browser harness uses the real LiveApp, ShapeQuestions, Surface renderer and in-memory Core. It verified initial question focus; disabled Continue until valid choice/text answers; continuation to the ordinary proposal preview with existing note retained and Install disabled until approval; cancellation returning to a non-installable builder; and pending-question recovery on renderer reload. It uses scripted tool responses, not a real model or native Tauri execution. Screenshot retained privately; no personal app data used. Temporary preview stopped.
- No model requests, paid inference, private credentials, installed user-data changes, native rebuild or installer deployment. No newly established Windows native, macOS or real-provider compatibility claim. README reviewed/updated. Snapshot v029 and earlier plans remain unchanged.

## User test and expected results

Rebuild and run source using the root README. Existing generated apps require the documented runtime sync/rebuild; an already installed preview does not update automatically. Keep the same Core and app host version while testing. Use a user-selected tool-capable development model/profile; real provider requests may incur charges.

1. Dashboard -> Model settings -> choose an explicitly configured endpoint/model and Agent tools. Open an app containing a saved recognizable note.
2. Shape this app -> Add independent Surfaces. Ask: "Add a small organizer with its own model. Before proposing changes, ask me whether I prefer a list or cards and what to call it. Preserve my existing app." Expect either bounded questions or a sensible direct proposal; the provider chooses whether clarification is needed. If it returns an incompatible response, expect a safe failure with no automatic mode/provider fallback.
3. When questions appear, check the scope and selected-model disclosure. Continue must stay disabled until every question has a valid answer. Choose answers and Continue building. Expect the same job to resume into its normal preview; answering alone must not install anything or change the saved note. No new model request should occur while merely waiting or typing answers.
4. Approve and Install only after reviewing the resulting proposal. Expect the addition and the original note to remain. Repeat with Modify this surface and a label change; sibling definitions and existing model schemas must remain protected, even if an answer asks for broader changes.
5. Start another question job and Cancel generation. Expect no installable result from that job. Repeat, then change app definitions from another window before answering: expect stale rejection, with no overwrite. Data-only edits must not falsely widen or reset definition scope.
6. Reload the renderer promptly while questions are pending and Core remains connected: expect the pending questions with blank, unsubmitted answers and original scope/model. Close all windows for that app beyond the three-second grace, or restart Core: expect pending work discarded safely, with original saved data retained. Pending questions also expire after 30 minutes.
7. Explicitly choose Basic JSON and repeat a normal request: expect the existing proposal flow without the new ask-user tool. No silent switch between modes.

## Boundaries and pending acceptance

Answers are temporary task input sent only after explicit submission to the profile selected when the job began. Core does not store the clarification conversation in app models or system Surface tables. A generated proposal can of course incorporate the user's requested content into reviewed definitions; existing explicit install approval governs that result. Do not enter credentials into clarification questions.

Maximums: two batches, three questions per batch, six choice options per question, 240-character question labels, 80-character choice labels/values and 1,000-character trimmed answers. Waiting expires at 30 minutes; active authoring retains 180 seconds total, 12 model turns, 24 tool calls and the existing validation/context budgets. There is no background scheduler, conversation persistence or permission-approval delegation. Same-app windows share app-owned jobs; this remains the existing local single-user trust model.

User feedback: pending. Real-provider question quality, native keyboard/focus behavior, Mac behavior and final installed runtime acceptance remain separate checks. Mallea may ask useful questions only when the selected provider produces the declared tool correctly; scripted tests establish mechanics, not reasoning quality.
