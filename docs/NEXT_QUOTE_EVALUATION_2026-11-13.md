# Post-fix quote evaluation — 13 November 2026

**Verdict: PARTIAL_FAILED_ACCEPTANCE_GATE. No new accuracy, safety or release-readiness guarantee.** Existing [run 43400093919](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43400093919) was watched to terminal **failure**, not redispatched. Source **a8757413f8fec8ec74c555ba896db8b18f1559c5**, tracked source clean. Artifact upload succeeded; proof status PARTIAL_OR_NOT_RUN, no harness errors.

## Identity and measurement boundary

Real Chrome Prompt API via production Firebase 13.2.0 ONLY_ON_DEVICE, Chrome **157.0.8103.78**, Linux x86_64 free standard public Ubuntu runner. **Actual model name/revision UNKNOWN**: neither the receipt's operator-written Nano label nor component/download names establish actual API-reported identity. No model alias inferred. Native launch omits sandbox-disabling/performance-bypass flags; not independent OS/GPU attestation. Page CSP connect-src none, zero blocked external page requests; browser-managed component downloads remain outside page CSP. No cloud calls, credentials, deployment or device work by this reporting task.

This is the **application detector adapter**, including strict exact-quote parsing and deterministic DATE postfilter, **not raw-model recall/precision**. DATE spans survive only immediately after explicit birth-date wording on their line. This can preserve useful deadlines but can miss identity dates with other contexts; non-DATE misclassifications remain. Regex below is the unchanged raw regexSpans baseline, not the filtered manual-suggestion path. Union is an offline union, not a separately measured combined production inference.

## Detection: 29 valid / 32 attempted

Three strict adapter errors: **hmrc-04, nhs-02, council-04**, all Nano quote absent from source. Native responses returned; fabricated whitespace/punctuation or ardin@example.invalid failed exact validation. Those notices contain **97** truth characters and are excluded, not treated as valid empty predictions. No 32/32 detector accuracy claim.

UTF-16 character-level micro counts on the **same 29 valid notices**, **955** annotated PII characters:

| Detector | TP / truth (recall) | TP / predicted (precision) | FP / FN characters |
|---|---:|---:|---:|
| On-device adapter + DATE filter | 839/955 (87.85%) | 839/1271 (66.01%) | 432 / 116 |
| Regex, same 29 | 350/955 (36.65%) | 350/659 (53.11%) | 309 / 605 |
| Adapter + regex union, same 29 | 858/955 (89.84%) | 858/1524 (56.30%) | 666 / 97 |

Full **32-notice** regex remains **406/1052 (38.59%) recall**, **406/730 (55.62%) precision**; that is not the 29-notice denominator. Character scoring measures coverage, not entity-kind correctness. False positives include Balance £24.50. tagged SORT_CODE, receipt date unknown. tagged ADDRESS, and the public negative control's Form 12345678/version 1234567890/example code 12-34-56. The adapter still over-redacts useful information; manual review remains necessary.

Successful detector latency n=29: nearest-rank p50 **12.7225 s**, p95 **16.4390 s**. All detector attempts n=32 p50 **12.7073 s**, p95 **16.4390 s**. Initialization/download **62.4912 s** separately. SDK/session/validation wall times, not pure model compute or image/OCR performance.

## Verifier: 20 attempted / 128 planned, zero decidable

| Group | Planned | Attempted | Accepted | Rejected | Unknown | Error | Timeout | Not run |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Authored mutations | 96 | 14 | 0 | 0 | 9 | 4 | 1 | 82 |
| Unmodified controls | 32 | 6 | 0 | 0 | 3 | 3 | 0 | 26 |
| Total | 128 | 20 | 0 | 0 | 12 | 7 | 1 | 108 |

Aborted **0** in all groups. Trial-019 (nhs-04 mutation) timed out at the 60-second outer-operation deadline; cancellation aborted its native prompt. Collector deliberately halted all later work: **108 NOT_RUN**, not errors, unknowns or rejections. Seven strict errors are absent source evidence quotes; e.g. invented No monetary amount is stated., joined sentences or fabricated newlines. No repairs, retries or synthesized decisions.

Decided coverage is **0/96 mutations, 0/32 controls**, also **0/14 and 0/6 among attempted**. Decided-subset catch and false-alarm rates are **undefined** (JSON null; importer NOT_RUN). Observed validated rejection counts **0/96 planned (0/14 attempted)** and validated control alarms **0/32 planned (0/6 attempted)** are only counts, not evidence of semantic accuracy. Unknown takes precedence if any submitted check is unknown; it is never counted as a rejection even when another check is unsupported.

Captured native prompts: **32 detector + 49 verifier = 81**, **80 successful and 1 aborted/error**. Verifier prompt histogram over planned trials: 108×0, 4×1, 3×2, 13×3. Native errors **1**, distinct from the seven strict verifier application errors and three detector application errors. Attempted verifier outer latency n=20: p50 **33.6462 s**, p95 **40.1510 s**; includes unknown/error/timeout, not successful-verifier latency. NOT_RUN zero durations must not enter performance percentiles.

## Comparison with prior failed measurements

[Prior report](QUOTE_EVALUATION_2026-11-13.md) and its raw evidence remain unchanged. Old run43348904459: **31 valid / 32**, **832/1023 = 81.33% recall**, **832/1546 = 53.82% precision**. New run: **29 valid / 32**, **839/955**, **839/1271**, with different valid subsets and deterministic DATE filtering plus changed prompts/parser. These are not controlled full-corpus or pure model before/after improvements. Old verification attempted all128, with54 unknown and74 errors; new attempted20, with12 unknown,7 errors,1 timeout and108 not_run. Both have **zero decidable**; fewer new errors do not demonstrate verifier improvement. Preserve earlier offset-protocol failures too; none is erased by this report.

## Evidence and reproduction

[Evidence](evidence/next-eval-43400093919/) preserves unchanged original receipt/proof/manifest/hardware/installation and terminal run metadata; derived importer, independent reconstruction and hash inspection are separate. Original receipt **576,812 bytes**, SHA-256 **dedb8ebf275ff89cb728bbf0cf6f36935ddaff90c9d58e9c3818736cdba34985**. All **50** original manifest entries, all81 native input/schema hashes, corpus hash and eight original source-byte hashes verified. Extra contract/DATE/typed-evidence/regex/privacy hashes were checked against git source commit, not falsely described as embedded in the original receipt.

Every native prompt/schema independently reconstructs exactly from production guidance plus original only, or original plus submitted claim batch. **No expected labels, truth annotations, variants, trial ids or expected verdicts were sent to native inference.** Candidate claims necessarily include test mutations; these are inputs, not expected answers. All successful detector stored spans reproduce from raw JSON through exact parsing and DATE filtering. Validated verifier outputs/checks reproduce under the source parser. Original screenshots/diagnostics remain in the complete local/Actions artifact (7-day retention); only hashes are committed here, not a redundant screenshot dump. NOT_RECORDED: screenshots are not video.

From this branch with complete artifact directory:

    node scripts/inspect-quote-eval.mjs ARTIFACT_DIR inspection.json 43400093919
    node scripts/inspect-next-eval.mjs ARTIFACT_DIR independent.json
    node scripts/evaluate.mjs import ARTIFACT_DIR/receipt.json

Offline gates: wiring **3/3**, collector **9/9**, operator TypeScript, both inspector syntax checks, manifest/source/hash and prompt/schema/adapter replay passed. These are TEST_ONLY/offline validation, not extra model trials. Generic inspection now requires explicit run id rather than hard-coding the prior URL and excludes NOT_RUN from attempted latency. The first offline inspection refused this run's real native abort because the prior script assumed all native calls succeeded; this report's inspection records that failure instead of modifying the receipt.

Scope remains 32 short authored synthetic notices; three authored fields, not real cloud-generated answers, complete explanation/draft two-key checking, real letters, end-to-end product journey, independent device attestation, Android, OCR/images or demo footage. **Useful subset detection with false positives; verifier acceptance gate still fails.**
