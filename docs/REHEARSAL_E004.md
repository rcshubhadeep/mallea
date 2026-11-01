# Permissioned Automation: testing and evidence

Windows reference, October 31, 2026. Advances milestone E4 under plan v024. Implementation and agent-operated checks are separate from the user's pending Windows and Mac acceptance. Linux testing is deferred. Do not start E005 before that acceptance/fix gate.

## Prepare

### Already built, Core still running

Closing app windows does not stop Core. From the repository root, run `node scripts/launch-app.mjs mallea-core`, then use Open app on the dashboard. No install/build/Core restart is needed just to reopen an already updated app. Start with an existing test app's Brief -> Concepts Automation if one is available: type a changed constraint, pause and check the resulting Concepts. This is the shortest first test. Sharing/revocation tests follow afterward.

The dashboard should show registered app cards and six illustrated catalogue concepts. Missing cards together with missing concepts is a connection problem, not an empty installation. Connection failures now appear in the recovery notice. After restarting Core, always close/reopen its dashboard to use the current native connection capability. Failed duplicate engine starts preserve the existing connection files.

The sections below explain framework upgrades and creating a new example. They are needed only for an older generated project or a fresh example, respectively. A Mac checkout has separate setup/data; follow MACOS_TEST.md later.

### Upgrade or fresh setup only

Keep the existing Core database; no reset or notes migration is needed. Close app windows before replacing their executables. Follow the root README to build the frontend/native host and restart Core, then open the dashboard and apps. Do not start a second Core on port 4318.

An older generated project embeds its previous framework runtime. Close that project's window and, after the repository frontend build, run from the repository root:

```sh
node scripts/sync-project.mjs <project-folder>
```

Use the actual generated-project folder in place of the placeholder. The command backs up managed files and preserves manifest/identity/Core data. Rebuild inside that project:

| Step | Windows PowerShell | macOS/Linux Bash or Zsh |
| --- | --- | --- |
| Enter project | `cd <project-folder>` | `cd <project-folder>` |
| Install tooling, if absent | `npm.cmd install` | `npm install` |
| Build | `npm.cmd --script-shell=cmd.exe run build` | `npm run build` |
| Open | `node project-host.mjs start` | `node project-host.mjs start` |

This upgrade is needed once for new framework behavior, including the owner protocol. Later Surface changes still install live without rebuilding. Reconcile custom changes to managed files with the backup. Fresh projects created after the current framework build already include the new runtime.

## 1. Build a small semantic example

Use a new small test app, or add two Surfaces to your existing notetaker through global **Shape this app**. Suggested prompt:

> Add two persistent Surfaces without changing existing ones. Brief contains a multiline text input labelled Brief, backed by a new local text field. Concepts contains a repeated list backed by a new local collection with one text field named text. Show each item's text and declare the list observable with observe:true so it can trigger an Automation when its data changes. Start with an empty list. Keep both models independent of the current notes.

Preview, approve and install. Generation is genuine and may need a bounded repair; inspect the proposed bindings rather than expecting identical IDs. Both Surfaces should appear immediately. Keep this test app open.

1. Right-click Brief → **Set Automation**. Step 1 should already identify the correct app/Surface/element. Choose **When I type**.
2. Step 2: read Brief; choose **Ask Meta Muse**. Instruction: “Extract the main idea, constraints and open questions as short list items. Reflect the actual colors and image restrictions.”
3. Step 3: choose Concepts in this app, Replace, and a name such as Brief to concepts. Check the explicit approval box and enable.
4. Write: “Design a community garden poster. Use monochrome colors and no photographs.” Pause. Expect a real model result in Concepts and a completed outcome in **Sharing & Automations**.
5. Replace the text with: “Design a community garden poster. Use bright red as the main color and include photographs.” Pause. Expect the changed restrictions in the new output. The exact wording is model-generated.
6. Pause the Automation in the manager. Change Brief again: Concepts should retain its old value. Resume and use Run now for a deliberate retry.

Typing is gated after a brief pause, not every keypress. Every qualifying pause can still consume inference; pause the Automation when finished. A rejected, timed-out or stale result leaves destination data unchanged and reports an outcome. A literal heading with no declared trigger should have Set Automation disabled. Clicking a nested list item can select its declared observable parent list.

## 2. Copy to another app, then revoke

In another running app, use Shape to add a persistent Received concepts Surface backed by a local collection with the same single text field named text. The two apps may render their lists differently.

1. In the receiving app's **Sharing & Automations**, use Change sharing for Received concepts. This exposes its resource metadata; it does not approve data access.
2. In the source app, right-click the observable Concepts list → Set Automation. Choose its data-change trigger, read Concepts, and **Copy unchanged**. Choose Received concepts in the other app as the destination, with Replace.
3. Expect **Owner approval needed** and activation disabled. Request write access. Do not approve anything yet: there should be no transfer.
4. In the receiving app's manager, find the request naming the correct source app/Surface, destination and write operation; choose Allow. Return to the source wizard, review the summary, approve and enable.
5. Use Run now on this copy Automation. Expect the same list data in the receiving app, rendered by its own Surface. Copy makes no model request. A later Concepts update should copy automatically.
6. Revoke the grant in the receiving app. Run now again from the source: expect a blocked outcome. Already copied data stays visible. Read and write permissions are distinct; a different requesting Surface needs its own grant.
7. Close the receiving app, then run again: expect unavailable/blocked, with old data retained. Reopen it. A still-approved copy subscription can reconcile on reconnect; a revoked grant must remain blocked.

Permission requests, Allow and Deny/revoke require explicit actions. Discovery and model generation cannot grant access. Changing an exposed action/schema requires fresh approval. Removing a referenced Surface pauses its Automation and invalidates its grants; reusing the same Surface ID does not revive that access.

## 3. Two-way artwork/review sync

Use test artwork/feedback because these steps intentionally save data. Keep Fieldnote and Parcel open.

1. In Parcel's manager, share the Surface containing published artwork. In Fieldnote, right-click **Save revision** → Set Automation. Choose **When I save a revision**, read **Saved artwork**, Copy unchanged, then Parcel's **Published artwork** destination. Request write access, approve it in Parcel, then approve/enable the Automation in Fieldnote.
2. Save a changed artwork and accompanying note. Expect Parcel to update automatically while its existing review comments remain intact.
3. In Fieldnote's manager, share the Surface containing received feedback. In Parcel, right-click the review list → Set Automation. Choose **When review feedback changes**, read **Review status and feedback**, Copy unchanged, then Fieldnote's **Received review feedback** destination. Request write access, approve in Fieldnote, then approve/enable in Parcel.
4. Add a review comment/status in Parcel. Expect the feedback in Fieldnote. Revoke one direction and verify that direction blocks while the unrelated direction still works.

These are typed image/note/revision and review adapters. They exchange data, never live UI trees. Manual refresh also uses the new owner-approved read path; the earlier receiver-side app access switch no longer grants permission.

## 4. Restart and Mac gate

Close apps and stop/restart Core using the README, then reopen apps. Persistent Surfaces, notes, Automation definitions, enabled states and grants should remain. A Muse Automation waits for its next trigger or Run now; restarting does not intentionally spend inference. Reopen the dashboard after Core restart. Session Surfaces expire after the last app instance disconnects and its reconnect grace elapses; their model data is retained, and dependent Automations pause.

Report the Windows results, then follow [MACOS_TEST.md](MACOS_TEST.md) on the Mac. A Mac checkout has its own Core data; Git does not carry ignored dynamic apps/notes across machines. Required Mac fixes precede delivery/video work.

## Agent-operated evidence and limits

- Fresh baseline: 12 focused tests and TypeScript. Original suite: 66/66 passed; after the dashboard startup/recovery repair, 67/67 passed, plus TypeScript, frontend and Windows native build. Tests use isolated databases and actual HTTP/MCP/owner sockets; domain image bytes in unit fixtures are not visual rendering evidence.
- Actual Windows native wizard: English trigger, Muse processor, compatible list destination, approval/enable, typing and changed-constraint output passed. An independently running recipient received the list through its owner socket. The native wizard blocked activation before owner approval; revocation blocked a later Run now. Owner permission changes in this native check were performed through owner-authenticated APIs, not clicks on Allow/revoke. The user steps above cover those remaining UI actions.
- The semantic native example used deterministic test Surface fixtures and genuine inference: one development request, 1,211 tokens. Isolated development validation used two changed constraints, approved transfer and revocation, 1,625 total tokens. One explicit direct-Meta compatibility request passed with 849 tokens. No fallback or scripted semantic result was used. Private reports retain timings/usage; credentials stay outside app/model records.
- Actual two-way domain sync, feedback retention, independent grants, typed MCP reads/writes/actions, offline owners, persistence, stale output, loop prevention, append deduplication and removed-resource behavior are regression-tested. The agent did not click save/review against the user's live artwork during this pass.
- Bounded scope: one transformer per Automation; Copy unchanged, email extraction or Muse text transformation; registered text/list and artwork/review destinations. No arbitrary code, scheduler, remote routing or general pipeline editor. At most 24 Automations per app; pause unused ones. There is no delete/edit-record UI yet; changed pipelines are created anew. Append skips an already-applied identical input to prevent reconnect duplicates. Latest outcomes are retained, not a full history.
- This is a trusted local single-user PoC, not hostile-process isolation. macOS remains untested until the user pass; Linux is deferred. E005 has not started.
