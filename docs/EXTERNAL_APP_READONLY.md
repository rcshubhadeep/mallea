# External-app read-only exploration

Parked at the user's request on November 6, 2026. Retain this design for later; do not start connector implementation unless resumed. The current discussion returns to Surface isolation, provider-neutral inference and tool-based authoring.

November 5, 2026. Branch: codex/external-app-readonly, based on the installer branch at 040d8d7. User authorized separate-branch exploration while macOS installer testing proceeds and clarified that external integration starts read-only. Main and the installer branch are unchanged. This is a design proposal, not an implemented connector or a change to the active numbered plan.

## Purpose

Let a Mallea Surface consume explicitly permitted data from an existing external application, without requiring that application to be rebuilt using Surfaces. Core owns the integration, credentials, authorization and external platform adapters. Mallea apps receive bounded typed snapshots through the existing registry/grant boundary, not raw accessibility trees, arbitrary MCP sessions or screenshots by default.

## Access methods

| Method | Appropriate use | Limits |
| --- | --- | --- |
| Official API or official MCP server | Structured Slack messages, channel/thread identity and provider permissions | Requires provider authentication, scopes and supported client/app distribution. MCP is a protocol, not automatic app access. |
| App-specific object model or add-in | Excel workbook/sheet/range values, including selected live data where supported | Windows automation and cross-platform Office add-ins need different adapters/deployment. A file snapshot is not a live workbook selection. |
| Platform accessibility | Explicitly selected app/window and exposed text, tables or controls | Windows UI Automation and macOS AX differ. Exposed data may be virtualized, partial or unavailable. No automatic switch to broader observation. |
| Screenshot plus OCR/vision | Explicitly permitted visual region when structural data is unavailable | Observation is approximate; preserve source region/time/confidence. GUI element classification alone does not recover message or cell semantics. No general continuous desktop capture in the first experiment. |

Prefer reliable structured data for a particular capability; allow the user to see which method is used. Do not automatically widen from an API grant to screen/accessibility access after failure.

## Proposed Core contract

External source identity (separate from Mallea app identity) -> named resource -> read capability -> typed snapshot. A connection authorization permits Core to reach the external source; a separate app/Surface grant permits one Mallea consumer to receive a specific resource. Data copied into a model has an explicit persistence choice. Revocation blocks future reads; already copied values are not silently erased.

Proposed snapshot fields: source ID, resource ID, schema, typed value, capture time, source revision when available, observation method, completeness/truncation and optional confidence. Do not invent provider revisions. A user-approved selector is pinned to the chosen workbook/sheet/range or workspace/channel/thread. Changing the active window/workbook must not silently retarget a grant.

Core exposes an allowlist of read operations with input/output schemas, bounded size and timeouts. Write methods and unknown tools are denied regardless of MCP tool hints or prompt wording. Apps cannot submit arbitrary OS commands, COM expressions, accessibility property paths or network destinations. Credentials stay in trusted Core/native storage, initially session-only unless a verified native credential facility is used.

Reading does not require an LLM. Summarization may use a separately selected configured model only after explicit approval to send the selected data. External text remains untrusted data; instructions inside Slack messages/cells cannot grant tools or widen permissions.

## Recommended first experiment (proposal)

Excel selected-range snapshot on Windows, bounded to one explicitly selected workbook/sheet/range, manual Refresh, exact typed values and no external writes. Use the supported Excel object model if the running-instance attachment spike succeeds; do not substitute opening a saved XLSX while claiming live app access. Show the snapshot in an existing disposable Mallea Surface/harness rather than creating a third polished product. No click/type/scroll helpers, formulas execution, macros, file saves or app launches are exposed.

Acceptance: distinguish no Excel, no workbook, non-range selection and multiple/ambiguous instances; cap cells/bytes/time; read current selected values, including an unsaved cell value after the user's edit is committed; pin resource identity; reject unauthorized app/Surface reads; revoke future reads; retain provenance; verify no workbook mutation or model/inference request. Chart/filter display can be deterministic. If a safe supported attachment cannot be established, report the blocker rather than widening access.

Slack follows as a separate adapter using an internal test app/workspace or other officially supported client route and only necessary read scopes. Start with a chosen channel/thread and manual refresh. Do not read the user's connected accounts, register apps, request OAuth consent or send messages during this research phase.

## Sources checked November 5

- [Slack MCP overview](https://docs.slack.dev/ai/slack-mcp-server/): official MCP supports channel/thread reads and search; authentication is required. Current documentation restricts use to Marketplace-published or internal apps and discusses desktop PKCE. Authentication/client registration feasibility needs a separate spike; a shared client secret must not be embedded in the installer.
- [Excel Selection](https://learn.microsoft.com/en-us/office/vba/api/excel.application.selection) and [Range.Value2](https://learn.microsoft.com/en-us/office/vba/api/excel.range.value2): selected objects may be ranges or other object types; values are available through the object model. Numeric date/currency representation needs explicit schema/format handling.
- [Excel add-in ranges](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/excel-add-ins-ranges-get): structured ranges are also available through the Office JavaScript API, requiring an add-in deployment path.
- [Excel Graph overview](https://learn.microsoft.com/graph/api/resources/excel?view=graph-rest-1.0): workbook APIs target supported OneDrive for Business/SharePoint/group-drive files; they are not a universal interface to arbitrary local running Excel windows.
- [Windows UI Automation control patterns](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-controlpatternsoverview): structured control interfaces exist, but providers determine what is exposed.

## Evidence and exclusions

Research/source inspection only: no connector implemented, no external app/account data accessed, no model calls, no new dependencies or runtime tests. Existing MCP/grant/Automation mechanisms are reusable implementation evidence, not proof of external-app support. Installer macOS work remains on its own branch; this branch does not change installer acceptance or claim Mac parity. README reviewed; no changes because no new supported behavior exists. A numbered plan/slice, fresh focused baseline and concrete bounded acceptance must precede implementation.
