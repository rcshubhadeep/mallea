# Automations that make the framework visible

Governed by PROJECT_PLAN.v021.md. These are candidate compositions of registered events/data/actions; they are not separate canned workflows selected by a prompt. No scenario here is implemented merely because it is described.

## Recommended: a living brief

In a new app, the user builds a Brief Surface with an editable text field and a second Surface called Concepts. They ask: "After I pause writing, extract the main concepts, constraints and open questions into this panel. Keep it up to date."

Example text: "The launch should feel warm and playful. Keep the headline readable on small screens. We need a first version by Friday, and the budget is still undecided."

Muse produces a small structured list: warm/playful direction; small-screen readability; Friday first version; budget unresolved. Then change Friday to Monday or add "avoid red": the result should update accurately. This is visibly semantic work beyond literal keyword matching. Do not promise perfect extraction or infer obligations not present in the source.

- Trigger: data.changed plus an idle/debounce gate, not every keypress.
- Input: approved brief field and source revision.
- Step: one bounded Muse request returning validated structured items.
- Output: Concepts collection, writable only by the approved Automation.
- Control: one in-flight run, stale revision discard, enabled/pause state, visible outcome and manual run fallback.
- Cross-app payoff: permit Parcel's chosen Surface to read the brief/concepts and show them beside artwork. Revoke only that Surface's access: its next refresh stops while the source app keeps working.

Recommended placement: the short new-project segment of the demo, after normal-app malleability and auto-sync have established the basics. It proves that app creation, agent authoring, model reasoning and typed data compose through the same framework.

## Strong existing-app alternative: feedback becomes a working checklist

Parcel review text: "Brighten the headline, retain the warm palette, and move the title away from the moon." A user-created Fieldnote Surface contains a checklist. A Muse Automation reads permitted review feedback and proposes concise actions. Editing the review updates the checklist, retaining manually checked items by stable identity where supported. Start with replacing a simple generated list if reconciliation becomes a distraction; disclose that behavior.

This gives the two-app designer workflow a clear payoff. It uses existing review data, adds meaningful Muse reasoning and avoids a third domain product. It is a good fallback if the new-project segment cannot fit both app construction and semantic Automation into the video budget.

## Fast deterministic example: date to available slots

One Surface selects a date. Another displays available times from a small declared availability table. Selection emits an event; an Automation queries that table and writes the matching slots. Changing date or booking a slot updates the result.

Use this to show immediate reactive composition and inspectable data/action wiring. It is deterministic execution, not model reasoning on every selection. Clearly label sample availability; no actual calendar integration, business availability or timezone service is claimed. A date-picker primitive, date field and slot collection are the necessary reusable pieces.

## Simplest cross-app Automation: saved design to review desk

Fieldnote saves an image/note revision. Parcel's approved linked Surface refreshes automatically after the source event or reconnect, retaining comments and avoiding duplicates. Revoke access and show blocked refresh. This should be in the main demo because it reuses the current scenario and makes discovery/permissions useful.

It demonstrates event-triggered coordination. Pair it with one semantic Muse example so substantive model participation is visible in both authoring and operation.

## Shared execution rules

Authoring follows the accepted three-step model: choose a preset English trigger, define the transformation and data read, then choose a compatible permitted destination element in this app or another app. Trigger and input remain separate internally. Element context menus preselect the source. See CONTEXTUAL_AUTHORING.md; no separate workflow editor is required.

All examples use the same record: owner app/Surface, typed inputs, trigger, declared bounded steps, outputs, access, enabled state and latest outcome. Input text is data, not authority to broaden permissions. Model calls use the shared engine configuration and never receive the API key. Reject malformed outputs; do not silently overwrite newer user data. Closing an app/Surface follows its declared runtime lifetime; no unimplemented always-on scheduler is implied.

For the hackathon, implement saved-design sync plus one semantic example. Date/slots remains an optional small capability probe, not another full application or mandatory scene.
