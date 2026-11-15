# Fixed verdict implementation — 15 November 2026

Implementation milestone below; the single authorized workflow is now complete. See [15 November measured failure](FIXED_VERDICT_EVALUATION_2026-11-15.md): 3/128 decided, 125 unknown; one typed deadline catch, not a reliable verifier. No accuracy, deadline-catch or release guarantee.

Read first: the actual failed receipt and [13 November report](NEXT_QUOTE_EVALUATION_2026-11-13.md): 29/32 valid detections, 839/955 recall and 839/1271 precision on that subset; 0/128 verifier decisions, 20 attempted, 108 not run. Those receipts are unchanged.

## Changes

- Nano wire contract quotes-v2-fixed: MATCH / MISMATCH / UNSURE per exact ID, plus exact quoted source evidence. Output syntax/status case/fences may vary; source quote bytes and IDs may not. Internal UI statuses remain supported/mismatch/unsupported/unknown. Legacy status spellings are read for old integrations, not requested in prompts.
- At most four short claims and 1600 claim characters per request. Long whole explanation/draft fields remain intact, alone. The three-field evaluation now needs one native request per trial instead of three. No field deletion, expected label, corpus annotation, target outcome, retry or corpus inflation.
- Missing checks and absent quotes are explicit claim-level unknowns, not fabricated model decisions. Duplicate/wrong IDs and malformed responses remain errors. Raw native outputs remain in receipts.
- Complete exact relevant sentences independently corroborate unique literal deadline/amount differences. Ambiguous multiple values, relative-date resolution, unrelated quotes and unsupported prose remain uncertain. Model-assisted textual checks are not semantic proofs.
- Detector keeps valid exact findings even when another finding is invalid; invalidFindings is counted and shown as a manual-review warning. Invalid findings are NOT fuzzy repaired. Full-notice scoring must include these misses, not exclude them as a convenient subset. Strict legacy parser remains available to reproduce older failures.
- Precision changes target financial amounts mislabelled as bank details and date commentary mislabelled as addresses; names, address formats and repeated Unicode remain eligible. Explicit birth DATE policy remains; deadlines stay visible. Review is mandatory.

## Wire coordination required

The shared contract changed. **Parent must relay quotes-v2-fixed to the Android worker before integration.** Android worker owns Kotlin adapters/parser and compatibility tests; this branch does not edit Kotlin. Native Android output must use MATCH/MISMATCH/UNSURE, exact IDs and quotes, while preserving missing/invalid-as-unknown semantics. Web branch is not an Android inference receipt.

## Existing audit items verified, not redone

Manual name/address suggestions, explicit birth/deadline DATE handling, reply/greeting role validation, unknown model identity, solo entrant wording and App Check negative-control 401 (not stale 403) already exist. Their unit tests remain required. No deployment, paid/cloud configuration, Mac install, device work, public release or contact is authorized here.

## Decision gate

By **18 November 2026**, if measured decided coverage and planted-deadline rejection remain inadequate, scale back the verification claim to an experimental local warning/unknown mechanism; keep manual review and exact-payload privacy. Do not promise a performance improvement or hide failures. Parent owns deployment and product-claim decisions. This document creates no automation or release authorization.
