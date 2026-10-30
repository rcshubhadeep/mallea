# Native foundation acceptance

Windows reference, October 30, 2026. Implements E001 under plan v021; this is evidence for E1, not a claim that E002-E005 are complete.

## Passed

- Persistent dynamic app manifests, app/Surface/element/model descriptors and declared English trigger metadata. Descriptors contain no data values or credentials. W1 event metadata does not execute Automations.
- Native identity is supplied from a private host configuration to Rust. The frontend cannot select another app by changing a role/URL. App-bound sessions and control-only registration reject spoof attempts. This is a same-OS-user PoC, not hostile-process isolation.
- Fieldnote and Parcel ran simultaneously in distinct native windows. Existing saved content, customization/disabled state, and grants were retained. A Fieldnote revision was saved and fetched in Parcel; Parcel feedback was posted and read back in Fieldnote through the owner connection and existing MCP operations.
- App-specific MCP facades advertise only the owner's capabilities. A read without a grant fails, an approved read succeeds, and revocation blocks the next read. Closing one owner changes only its presence.
- A third project was generated and compiled in a temporary folder outside the framework checkout. It installed its own pinned Tauri CLI, used copied frontend/native sources and a fresh Cargo target directory, and launched with a distinct identity. Its initial app content consisted only of Shape access. First separate compilation: 3m09s with dependency downloads cached; tooling installation took about 4s. This is not a clean-machine timing claim. The framework host's first updated build took 1m40s; final cached rebuild took 50s.
- Live development-model authoring added an Ideas card with a multiline local field. Two invalid proposals were repaired within the existing three-attempt limit; preview/approval/install succeeded without recompiling the app. A note was edited and saved. No scripted authoring output was used.
- Core and all three native windows were then restarted. The generated Surface and edited note reappeared; the two demo apps reconnected with their original identities. The final shared host also sets its document title from verified metadata.
- A bounded direct-Meta new-app service check succeeded on attempt 1 in about 7.4s: 6,535 input tokens and 1,117 output tokens. It verified approved install, local editing and persistence after an engine restart. This is service evidence, separate from the native visual check.
- Final sequential regression suite: 39/39 passed; TypeScript passed. A concurrent regression run during Rust compilation hit four pre-existing worker deadline/rejection paths; rerunning sequentially after the build passed with execution limits unchanged.

## Reproduce

Follow root README for prerequisites, explicit inference configuration, Core startup, frontend/native build and the two launch commands. Source builds require network access for missing npm/Rust packages. Core defaults to one ignored database and loopback port 4318; the older companion must stop before Core starts.

1. Open Fieldnote and Parcel. Expect different native titles and interfaces, each with Shape access.
2. In Fieldnote, change the revision note and save. In Parcel, allow saved-design access if needed, then refresh. Expect the saved image/note and source revision; unsaved drafts stay in Fieldnote.
3. Post a new comment in Parcel. In Fieldnote, allow feedback access if needed, then check feedback. Expect that comment. Revoke access and retry; expect no new read.
4. Use README's blank-project commands in a new folder. Expect only Shape initially. Request a local notes field, build, inspect preview/access, approve and install. Expect the new field immediately, without a Rust rebuild.
5. Write a note; wait for Local changes saved. Close/relaunch the generated project. Expect the installed field and saved note. Stop/restart Core against the same database and repeat; identities and data should remain.
6. Run the documented sequential tests separately from compilation. Expect 39 passing tests. Optional live checks consume the explicitly selected model budget; no automatic production fallback.

## Remaining limits

The two existing domain adapters remain specific to artwork/review data. Generic apps currently support the bounded local text/color/layout vocabulary, not arbitrary data models, collections, custom native code or unlimited workflows. Activation still versions one composed app workspace. Independent Surface composition/lifetime, richer typed models/actions, right-click editing and complete framework-panel Surface coverage belong to E002. Dashboard/settings/graphical creator/catalogue belong to E003. Surface grants, auto-sync and executable Automation belong to E004. Web delivery and Observer remain parked.

Core must be started explicitly; generated apps are not standalone engine installers. Linux/macOS source guidance is supplied but native execution is untested. Existing local credentials are developer bootstrap files, not an OS vault. Shared Meta-only dashboard configuration is not implemented. User acceptance of this slice is recorded separately from these agent-run checks.
