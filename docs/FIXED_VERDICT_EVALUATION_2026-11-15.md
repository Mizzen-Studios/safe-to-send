# Fixed-verdict evaluation — 15 November 2026

**FAILED ACCEPTANCE GATE: 3/128 trials decidable, not “most decidable.”** One planted deadline was caught by the independent typed adapter despite Nano saying MATCH. Detection coverage is useful but still over-redacts and misses PII. No accuracy, anonymity or release-readiness guarantee.

One authorized free workflow [43716506683](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43716506683), branch council/fixed-verifier, measured source **9e905a9509f6ce257774a8259557226440346b71**. Watched to terminal **failure**; artifact upload succeeded. No rerun, repairs to native output, corpus changes, cloud calls, credentials, deployment, device/Mac work or paid resources. Run ended 13:32:58 UTC; proof status PARTIAL_OR_NOT_RUN records failed acceptance, with zero harness errors.

## Identity and protocol

Real Chrome Prompt API through Firebase 13.2.0 ONLY_ON_DEVICE, Chrome **157.0.8103.78**, Linux x86_64 standard free public Ubuntu runner. **Actual model name/revision UNKNOWN**: the receipt’s operator label is not API-reported identity. No model alias inferred. Page CSP connect-src none; zero blocked external page requests. Browser-managed model downloads are outside page CSP. Native sandbox launch is not independent OS/GPU attestation.

Exactly **160 native prompts = 32 detector + 128 verifier**, all returned, zero native errors/aborts. Every verifier trial used **one small three-claim batch**, not three serial prompts. All native prompt/schema hashes, production prompt reconstruction and submitted IDs reproduce. Native input contains guidance plus original only, or original plus submitted claims; **no truth spans, expected labels, trial IDs, variants or target outcomes**. Whole product explanation/draft/action coverage is preserved in code, but this experiment checks only the unchanged three authored corpus fields—not full product journeys or genuine cloud-generated answers.

## Detection: full 32 notices, 31 clean + 1 explicit partial response

UTF-16 character-level micro counts; kind correctness is not scored. This is the **production adapter** including exact-quote validation, partial-finding diagnostics and deterministic automatic-redaction filters, not raw-model precision/recall.

| Scope / detector | TP / truth (recall) | TP / predicted (precision) | FP / FN |
|---|---:|---:|---:|
| Adapter, all 32 | **990/1052 (94.11%)** | **990/1383 (71.58%)** | 393 / 62 |
| Regex, same full 32 | 406/1052 (38.59%) | 406/730 (55.62%) | 324 / 646 |
| Offline adapter + regex union, full 32 | 1007/1052 (95.72%) | 1007/1651 (60.99%) | 644 / 45 |
| Strict-clean subset, 31 (excluding partial dwp-01) | 981/1029 (95.34%) | 981/1371 (71.55%) | 390 / 48 |
| Same 29 notice IDs as prior report | 903/955 (94.55%) | 903/1209 (74.69%) | 306 / 52 |

**No notices excluded from the headline full-32 result.** dwp-01 returned one absent source quote containing a fabricated NUL before £85.20. That finding was not repaired or used; its valid findings and missing personal name remain scored. This is **one invalid finding**, not 32/32 pristine model outputs. Detector errors/timeouts/aborts/not_run: all **0**. Prior three whole-response failures hmrc-04/nhs-02/council-04 now have exact parseable quotes, but their semantic errors remain: hmrc-04 tags a 65-character public illustration as REFERENCE, nhs-02 misses the birth date, and council-04 marks a public example postcode as ADDRESS.

False positives still include public form/version/example codes, a council balance as ACCOUNT, and a deposit statement as SORT_CODE. Misses include three personal names, a partial NI suffix, one birth date and one postcode. See independent.json for exact examples and all notice counts. Names/PII are not removed from truth to improve statistics; broad addresses and repeated Unicode remain eligible. Automatic deadline DATE preservation remains, but labelling a whole birth-date phrase can defeat the strict birth-context filter. **Mandatory manual review remains necessary.**

The previous run measured 839/955 recall and 839/1271 precision on only 29 valid notices (87.85%, 66.01%). The new same-ID subset is listed explicitly, but prompts, parser handling and filters changed, and these are separate model executions—not a controlled raw-model before/after or a generalization claim. Original receipts/reports remain unchanged.

## Verification: all 128 attempted, 125 unknown

| Group | Planned / attempted | Accepted | Rejected | Unknown | Error | Timeout | Aborted | Not run |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Authored mutations | 96 / 96 | 0 | **1** | 95 | 0 | 0 | 0 | 0 |
| Unmodified controls | 32 / 32 | **2** | 0 | 30 | 0 | 0 | 0 | 0 |
| Total | 128 / 128 | 2 | 1 | **125** | 0 | 0 | 0 | 0 |

- Decided coverage **3/128 = 2.34%**, mutations **1/96 = 1.04%**, controls **2/32 = 6.25%**. Planned and attempted denominators are equal in this run.
- True decisions: **1 mutation rejection + 2 control acceptances**. False decisions among decided trials: **0 mutation acceptances + 0 control alarms**. The remaining **95 mutations + 30 controls are unresolved**, not correct decisions, rejections or measured false negatives.
- Deadline mutations: **1 rejected, 31 unknown / 32**. Amount mutations: **0 rejected, 32 unknown / 32**. Action mutations: **0 rejected, 32 unknown / 32**.
- Decided-subset catch is **1/1** and control false alarms **0/2**. These tiny selected denominators are **not full-corpus accuracy or 100% safety**. Observed rejection count over all planned mutations is **1/96**; observed control alarms **0/32** with 30 controls unresolved. Amount/action decided-subset rates are undefined (JSON null).

**Decisive example:** trial-021, tenancy-04 deadline changed to 2026-12-31. Nano returned MATCH with the complete source quote containing inspection 15/12/2026. The independent typed checker produced mismatch; amount and action were supported, so the three-field trial was rejected. **This proves one adapter catch, not Nano correctly detecting that deadline.** Accepted controls: tenancy-04 trial-100 and tenancy-06 trial-114.

There are **384 submitted checks**. Raw Nano statuses: 227 MATCH, 104 MISMATCH, 53 UNSURE. **54 checks contain absent source evidence quotes**; they become explicit unknown, not hidden application errors or fabricated evidence. No IDs missing. Normalized wire statuses: 199 supported, 89 mismatch, 96 unknown. After independent evidence grounding: **60 supported, 14 mismatch, 310 unknown**. Thirteen of those mismatches occur in trials containing another unknown, so those trials remain unknown—not rejected. Unknown precedence has not been relaxed to inflate catch counts.

Primary failure is still evidence relevance/completeness, not just JSON formatting. For example, hmrc-01 and dwp-01 controls label the correct action MATCH but cite the greeting/identity sentence. hmrc-02 invents the quote “No monetary amount is stated.” and gives only the action fragment “Send evidence.” Those stay uncertain. Loosening quote existence or single-word overlap would hide these failures; the regression suite rejects negation reversal, wrong quotes, partial money, unrelated date-only claims, duplicate/missing IDs and unsupported appended explanation/draft assertions.

## Latency and evidence

Nearest-rank wall-clock milliseconds, SDK/session/validation included—not pure model compute. Detector n=32 p50 **11.1157 s**, p95 **14.9643 s**. Verifier n=128 p50 **12.7890 s**, p95 **16.8273 s**. Initialization/download **59.6782 s** separately. No NOT_RUN zero times enter these distributions. Previous outer verifier n=20 p50 33.6462 s and p95 40.1510 s used different batching and partial coverage; the comparison is descriptive, not a controlled speed guarantee.

Original [evidence](evidence/fixed-eval-43716506683/) preserves receipt, proof, manifest, run metadata, hardware/installation. Receipt **1,169,260 bytes**, SHA-256 **45c997d36bacf68da3104bd4f5fe128f8a2abff8db9baa41f1f10d6fdf90ca52**. All **81 manifest entries**, **15 embedded source hashes**, **160 native prompt/schema hash pairs**, corpus hash and adapter decisions verified. Complete artifact/screenshots remain downloaded locally and in Actions (7-day retention); screenshot hashes are preserved without redundant image dumps. Screenshots are **not video**.

Offline final gates: **254/254 unit tests**, **9/9 operator collector tests**, **3/3 wiring tests**, operator TypeScript, both product/broker builds, both inspector/importer syntax checks, diff check and immutable receipt replay passed. Parallel offline importer tests emitted one non-fatal local Vite HMR-port warning; assertions and builds still passed. These are offline gates, not additional model trials or fresh browser/device UI proof. Source copy changes are not deployed.

Derived independent inspection and generic integrity inspection both passed against the unchanged receipt. Importer’s older legacy catch-rate output used only the one decided mutation; its initial output is preserved separately. Importer now explicitly labels DECIDED_SUBSET_ONLY and includes 96/32 planned denominators, 95/30 unresolved counts and actual attempt-status coverage. No original receipt was changed.

Reproduce from this branch with the complete downloaded artifact directory:

    node scripts/inspect-fixed-eval.mjs ARTIFACT_DIR independent.json 43716506683
    node scripts/inspect-quote-eval.mjs ARTIFACT_DIR inspection.json 43716506683
    node scripts/evaluate.mjs import ARTIFACT_DIR/receipt.json

## Product decision and 18 November fallback

The requested “most decidable” target **failed**, although a planted deadline was caught and all trials completed. Scale the claim back **now** in source copy to **experimental local checks / warning-or-unknown**, not a reliable verifier. Manual review and immutable exact-payload privacy stay central. **18 November remains the hard claim-scaling deadline**, not a promised performance fix or permission for more blind runs. Parent owns integration/deployment; Android worker owns Kotlin migration to quotes-v2-fixed. No further inference was dispatched.
