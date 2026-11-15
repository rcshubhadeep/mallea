# A001: interactive Shape clarification

First implementation PR in CORE_ECOSYSTEM_ROADMAP.md, authorized as Core direction November 13, 2026 and started November 14. Advances E2/E3. Source implementation and deterministic/browser checks are recorded in REHEARSAL_A001.md; real-provider/native/user acceptance remains pending. Branch codex/shape-clarification is stacked on roadmap PR #4, based on main 3d54f14; neither PR is merged by this slice.

## Numbered units

| Unit | Scope | Acceptance |
| --- | --- | --- |
| A1.1 | Core-owned question/answer contract | Add a strict bounded ask-user tool: at most three questions per batch, short labels and bounded choices/answers, stable question IDs, and at most two batches per job. Questions/answers are untrusted data, never permission changes or executable definitions. Core chooses the system question Surface; the model cannot define its arbitrary UI/actions. |
| A1.2 | Pinned job suspension/resumption | One pending batch, original app/Surface/focus/policy/model configuration, original draft and cumulative turn/call/error/context budgets. Waiting for a person does not consume inference time; give pending clarification a separate bounded expiry, initially 30 minutes. Resume inference only on explicit valid submission. Reject unknown/repeated answers, wrong-app access, cancelled/expired jobs and stale definition revisions. Retain per-app serialization while waiting; restart discards pending work safely. |
| A1.3 | Temporary system Surface | Render choice/text questions and Submit/Cancel through the existing Surface renderer. Answers stay in temporary builder state, never app models. Explain current scope and that answering does not install changes. Keep keyboard/focus behavior and prevent accidental duplicate submission. Cancellation must remain available while waiting. |
| A1.4 | Verification and handoff | Deterministic tests cover tool validation, scoped continuation, invalid/cross-app/replayed submissions, cumulative budgets, waiting timeout, cancellation, restart/staleness and late results. HTTP/renderer checks plus full regression/type/build checks. Real-provider/native/user evidence recorded separately. README review and exact user test required. |

Detailed implementation choices must preserve the existing approval/install transaction and authoring policy replay. Do not hold a model request open while waiting for the user. Unknown sessions and failures cannot expose other app questions or private draft context. Session-only clarification answers may be forwarded to the explicitly selected model to continue the request; say so in the question UI. Model keys remain unavailable to app/Surface/model context.

## Exclusions

No A2UI dependency/protocol migration, free-form model-authored system panels, draft streaming, arbitrary host/network tools, permission-approval delegation, persisted conversations, background autonomous authoring or automatic Basic JSON/tool/provider fallback. Existing Basic JSON remains usable without the new tool; unsupported tool capability is explicit. No marketplace implementation or showcase apps in this slice.

## User test after implementation

1. Open an app with a configured tool-capable model; Shape -> Add independent Surfaces. Request a small organizer with an intentionally unspecified display choice. If the model needs clarification, expect a temporary question panel naming the scope and the selected-model data disclosure.
2. Choose answers and Submit. Expect generation to continue, then a normal proposal preview. Existing app data/layout remains unchanged until explicit approval/install.
3. Repeat and Cancel while questions are pending; expect no installable late result. An answer submitted after another definition edit must be rejected as stale. Restart Core while waiting; expect no resumed job or persisted private answers.

Provider discretion means a model may reasonably proceed without a question. Automated scripted tool calls establish protocol behavior; only a real-provider rehearsal establishes actual clarification quality. The steps above remain pending user acceptance, not evidence that a particular provider asks useful questions.

Implementation limits: each batch has up to three questions; choice questions offer two to six unique values. Labels are bounded; text answers are trimmed and limited to 1,000 characters. At most two batches per job. Question definitions are inspectable system-owned session Surfaces, held in memory and exposed only to the owning app. Unsubmitted answers remain local to the question panel and are lost on renderer reload. Pending questions can recover on reload within the same live Core/owner session; after the last owner stays disconnected for the existing three-second grace, they are cancelled. Core restart discards them. Waiting has its own 30-minute expiry and pauses, rather than resets, the cumulative 180-second active authoring budget. Other turn/call/error/context limits remain cumulative.
