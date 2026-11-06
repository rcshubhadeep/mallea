# Core hardening checks and user acceptance

This branch advances E2 Surface isolation and E3 shared model access. It starts from main, not the installer branch. The existing installed app does not acquire these changes. External-app integration remains parked.

## Fresh automated and agent-operated evidence

- Entry: focused author/live/dashboard checks 25/25. Final complete suite: 90/90; TypeScript and both frontend builds passed. The existing bundle-size advisory remains. README reviewed/updated for provider settings, authoring scope and platform limits.
- New deterministic checks exercise preservation, shared-model rejection, arbitrary model identities, endpoint/credential boundaries, authoritative API lookup, sanitized context, repair feedback, draft completion, unsupported responses, malformed/unknown tools, model-turn/tool-call/error budgets, cancellation, stale definitions, provider failures, app-level serialization, HTTP authoring, approval, install replay, tampering and data entered while previewing.
- Transport checks verify exact model/tool forwarding, safe HTTP failure categories, redirect refusal and a 2 MB response limit. These use mocked responses, not paid providers.
- Renderer harness used the actual AppView and settings adapter with synthetic data: entered text survived a long independent addition; existing Surface bounding rectangles matched before/after in grid, columns and rows at narrow width, and grid/columns at 1200 px. Custom endpoint/model/mode/key controls rendered. This is browser evidence, not native or user acceptance. Temporary preview stopped.
- No real model requests, private settings migration, native rebuild, installer rebuild or macOS execution in this slice.

## Source user tests

Use the normal source setup/build/run instructions in README on this branch. Rebuild existing generated projects with the existing sync-project procedure before expecting new controls; Core alone cannot upgrade their bundled renderer. Keep the installer branch's packaging and macOS verification separate.

1. Dashboard -> Model settings -> Custom endpoint and model. Enter your provider's HTTPS API root (OpenRouter: `https://openrouter.ai/api/v1`), exact provider model ID and session API key. Select Agent tools for a function-calling model. Apply. Expect the model ID and Ready, without a key appearing in app metadata. A wrong key should produce a safe authentication failure when authoring, with no automatic retry/fallback. Restart Core: custom credentials/settings must be gone.
2. Open an existing app, enter/save a recognizable value, and note its current layout. Shape this app -> Add independent Surfaces. Request: “Add a separate quick-notes Surface with its own new model, a text input, Save button and saved list. Preserve all existing Surfaces.” Expect a draft and change list, no installed change yet. Preview, approve and install. The addition should be below existing content; old content and actions should still work and saved data should remain.
3. Right-click an existing heading -> Modify this surface. Request a label or typography change. Expect only that Surface's definition to change. A request to change app theme, another Surface or an existing model schema should be rejected or reported unsupported. Choose Edit the whole app instead to widen explicitly.
4. Global Shape -> Edit the whole app -> “Use a dark teal theme.” Preview/approve/install. Expect the shared theme to update. Undo should restore definitions/theme and retain current data.
5. Start a tool job, then Cancel. Expect no installable result from late model output. Generate a ready draft, install another change from a second window, then try the first draft: expect stale rejection. Data-only changes while previewing should survive a valid install.
6. For a model without function calling, explicitly choose Basic JSON in settings. Expect the existing three-attempt proposal flow with the same scope/policy checks. Tools mode must report incompatible text-only output rather than silently changing modes/models.

## Limits

The wire format follows [OpenRouter’s function-calling documentation](https://openrouter.ai/blog/tutorials/tool-calling/). Real provider quality and exact model IDs are not verified; use the provider's catalogue, and expect usage charges. “OpenAI-compatible” here means HTTPS non-streaming Chat Completions with bearer authentication, model/messages and either JSON content or function calls. Responses-only APIs, local HTTP endpoints, streaming, multimodal authoring, vendor-specific reasoning parameters and automatic fallback are outside this slice. Image generation remains its separately configured capability. Stored Automation processor ID `muse` remains for compatibility, but its displayed name and execution use the selected shared model.

Independent additions intentionally cannot reuse existing models, adapter primitives/actions or existing layout slots. Choose app-wide editing when that coupling is wanted. Scoped edits may create new models but cannot extend existing ones. Surface growth, changed viewport size, model-data-driven visibility and deliberately app-wide edits can still affect layout; no cross-platform pixel guarantee is claimed. Existing pre-C001 unscoped drafts retain their earlier semantics. Core and apps trust the same OS user.

Tool authoring: at most 12 model turns, 24 calls, four rejected tool calls before stopping on the fifth, 30 cumulative operations, 4096 output tokens per turn, 180 seconds total and 240,000 characters of conversation. Calls use the configured provider's 60-second request timeout. Tool changes are atomic draft operations and finish only saves a preview. No filesystem/native/network/install tool is exposed. API schemas come from the same validators; runtime compatibility checks remain authoritative.

User feedback: pending. Browser checks and automated checks above are not user acceptance. Windows native behavior, macOS behavior and actual OpenRouter/model generation remain pending.
