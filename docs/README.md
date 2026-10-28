# Mallea documentation

Active project plan: [PROJECT_PLAN.v012.md](PROJECT_PLAN.v012.md).

This is the implementation guide for the hackathon project. Read the active plan before starting work. The initial plan records the conversation's direction and identifies assumptions that still need validation.

- [FOUNDATION.md](FOUNDATION.md): clarified product philosophy and the decision guide for malleability, agents, and bidirectional capabilities.
- [FOUNDATION_REVIEW.md](FOUNDATION_REVIEW.md): expanded hosted-web/local-companion vision, technical-brief review, proposed identity/provenance/locality boundaries, and code gaps before revising the foundation.

- [FOUNDATION_PLAN.md](FOUNDATION_PLAN.md): accepted minimal PoC contracts, reuse boundaries, deferrals and runnable delivery.
- [DEMO_PLAN.md](DEMO_PLAN.md): approved scratchpad/review-board storyboard and acceptance.
- [SLICES.md](SLICES.md): bounded M1-M4 sequence.
- [SLICE_004.md](SLICE_004.md): Observer and feedback return, defined/not started.
- [SLICE_005.md](SLICE_005.md): publishing Automation and try delivery, defined/not started.
- [SLICE_006.md](SLICE_006.md): platform evidence, video and submission, defined/not started.
- [STATUS.md](STATUS.md): mutable implementation progress, next actions, and verification evidence.
- [CHANGELOG.md](CHANGELOG.md): append-only record of plan revisions.
- [SLICE_001.md](SLICE_001.md): completed browser authoring slice.
- [CAPABILITY_AUDIT.md](CAPABILITY_AUDIT.md): post-slice capability probes, observed limits, and the unsupported-request fix.
- [SLICE_002.md](SLICE_002.md): completed cross-app slice, work units, and acceptance gates.
- [ARCHITECTURE.md](ARCHITECTURE.md): implemented ownership, routing, MCP, and execution boundaries.
- [REHEARSAL_002.md](REHEARSAL_002.md): observed native/browser rehearsal and model timing evidence.
- [PROGRESS_REVIEW.md](PROGRESS_REVIEW.md): goal comparison, reusable mechanisms, domain assumptions, and recommended next work.
- [SLICE_003.md](SLICE_003.md): M1, distinct apps and first model-authored working native Surface; defined, not started.
- [IDEAS.md](IDEAS.md): uncommitted candidates with explicit admission gates; these do not expand active slice scope.
- `PROJECT_PLAN.vNNN.md`: immutable plan snapshots, numbered consecutively.

## Exact-preservation revision procedure

1. Identify the smallest passage that must change and the reason. A change to goals, scope, architecture, milestone acceptance, provider policy, or deliverables requires a new plan version.
2. Copy the active snapshot to the next numbered filename using a byte-preserving file copy. Never overwrite an existing snapshot.
3. Apply localized replacements to the new file only. Preserve every byte outside the changed passages. Do not normalize line endings, encoding, spacing, wrapping, or headings. Use a byte-oriented replacement when a text editor cannot guarantee preservation.
4. Check that the previous snapshot's SHA-256 hash is unchanged. Compare the new file against the previous snapshot and verify that every difference is intentional; for byte-range replacements, verify all untouched byte segments match exactly.
5. Append a revision entry to CHANGELOG.md with the old and new filenames, reason, affected sections, and validation performed.
6. Update only the active-plan link above. Future work follows that snapshot; all earlier snapshots remain available.

The snapshot filename carries the version; do not add changing version headers, dates, or revision histories inside otherwise unchanged plan content. Routine implementation status belongs in STATUS.md, not in rewritten plan snapshots.

Plan revisions can be made as necessary within the user's authorized work; this process does not introduce an additional approval step.
