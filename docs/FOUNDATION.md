# Mallea's foundation

This records the user's clarified product philosophy. It is the decision guide alongside PROJECT_PLAN.v009.md. It describes the intended foundation, not a claim that all of it is implemented.

## The idea

Explore how application development and software behavior change when agents participate natively in the environment. Users should be able to reshape software while using it, with their current data, task, and permitted capabilities available to the authoring process.

A running app should have an inspectable, persistent model of its views, bindings, interaction state, behavior, capabilities, and participating agents. Its interface is a presentation of that model. The authoring agent can propose changes to the model; the framework validates, previews, and activates them while preserving authoritative data.

Communication and modification fuel each other. Another app's registered resource or action becomes something a view/behavior can bind to. A user can change what their app displays or does using those capabilities, and can make changes in either direction. The product promise is the ability to compose and reshape software in context.

The long-term ambition includes rethinking an OS from these primitives. The current hackathon deliverable remains an application framework running on existing browser/native hosts. React and Tauri provide rendering and hosting; they need not dictate the application model exposed to humans and agents.

## The acceptable MVP constraint

Constrain the language used to build software: a small set of elements, layouts, bindings, transformations, actions, and permission rules. For example, a renderer may support text, images, buttons, inputs, repeated items, and a few layouts.

Within that language, let the model compose different useful structures and behaviors from app-provided schemas. The engine must not identify a user intent and select one of a few prewritten final workflows. Evidence review and retest are possible examples of the vocabulary's use, not the foundation's identity.

Domain apps still need trusted adapters for their data and actions. Generality means the shared composition/binding/action machinery can consume those registrations without knowing domain field names or workflow names. It does not mean any imaginable capability is available, or that permissions and domain invariants disappear.

## First-class agents

The built-in authoring agent must be able to inspect the current app model and compose it using the same registered resources/actions available under its authority. User-created agent definitions should be explicit app entities with identity, purpose, permissions, behavior/trigger, and observable state when those features are implemented.

Do not call a metadata record autonomous execution. Keep model authoring/reasoning, deterministic reactions, and proposed future autonomous behaviors distinguishable. The observer should eventually notice useful opportunities in the current environment and propose a model change through the same authoring path.

## Two outcomes guide the build

1. A compelling three-minute demonstration showing software transform at the point of use, with substantive Meta participation and meaningful bidirectional effects.
2. A reliable way for other people to try the supported vocabulary, replay labelled real artifacts, and attempt supported requests of their own.

Foundation work belongs on the critical path when it enables those outcomes. A communications feature with no visible software transformation is insufficient; a rearranged screen with no useful data/actions is also insufficient. Broad abstraction without a working demo is not the target either.

## Current gap

Slices 001-002 establish working runtime pieces: authoring, validation, preview, isolation, versioned persistence, native/browser hosts, and scoped cross-app evidence. The SDK still fixes a review slot, known field paths, acknowledgement, and two policies; the host body and gateway retain domain branches. We must bridge that gap before describing Mallea as this live application-model framework.

The next proposed slice therefore targets model-driven main-surface composition and schema-driven local/remote actions together. A tiny unrelated fixture should test that the shared engine does not rely on the game's domain, without adding another polished product.

## Evidence required

- A natural-language request changes a meaningful working surface and its bindings/behavior during use.
- A different request produces a materially different composition within the same published vocabulary.
- Both browser and actual native app use that same mechanism; permitted actions work in both directions.
- The changes preserve data and survive reload; invalid proposals and denied operations leave the prior app usable.
- A new small contract fixture can use the mechanism without edits to the shared engine.
- The demo distinguishes live generation, saved replay, authored code, and deterministic execution.

The philosophy is a design hypothesis. Do not claim established novelty, universal generation, or a finished OS from this bounded implementation.
