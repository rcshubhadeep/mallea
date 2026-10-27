# Candidates outside committed slice scope

These are proposals, not implemented features or additions to active acceptance criteria. Promote a candidate into the project plan only after its stated admission gate passes.

## Contextual explanations in the proactive agent flow

Purpose: help people understand what they are creating and controlling while they modify their app. Explain one relevant concept at the moment it matters, using the actual proposed capability and its permissions. Do not infer a user's intelligence or experience from interaction frequency.

Proposed experience: the observer notices repeated evidence lookups and offers a review assistant. Its suggestion or preview includes a short explanation: This assistant can check linked evidence and flag changes. You choose what it can access. Show only capabilities and behavior the package actually supports. Clarify the difference between model reasoning and ordinary event-driven rules when relevant; do not label every deterministic reaction as an LLM decision.

Make further explanation optional through a What does this mean? disclosure. No separate lesson screen, tutorial chatbot, quiz, forced onboarding, or additional model request solely for teaching. The framework owns concise, reviewed explanations of core concepts such as access, triggers, and previews. The existing agent may ground them in the current task using validated capability metadata; it must not invent guarantees. Allow people to hide explanations and avoid repeating dismissed material.

Demo proposal: one sentence in the existing suggestion/preview card, with at most six seconds of narration during the already planned observer-to-builder transition. It must not create another scene or replace generation, follow-up revision, cross-app behavior, or persistence evidence.

Admission gate: after the observer and builder work, rehearse the existing three-minute story with and without the explanation. Keep it only if it fits within 180 seconds, accurately describes the implemented capability, and helps a viewer unfamiliar with agents explain what the assistant can do and what remains under user control. If it requires a separate flow, obscures the transformation, or merely introduces jargon, omit it from the hackathon demo.

Status: unvalidated candidate for the Day 8/9 demo refinement work. Not part of Slice 001. Its learning value and timing have not been tested.
