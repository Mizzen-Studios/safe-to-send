# Quote-only evaluation — 13 November 2026

**PARTIAL / failed acceptance gate, not release evidence.** Existing [run 43348904459](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43348904459) was watched to terminal completion, not redispatched. Source: `1b719969e5661389a762ae5a2c43e67c8166cfca` (clean tracked source). GitHub conclusion **failure**: all 160 outer operations were attempted, but strict successful/decidable coverage was incomplete. The artifact upload succeeded; proof reports PARTIAL_OR_NOT_RUN with no harness errors.

## Identity and boundary

- Real Chrome Prompt API through production Firebase 13.2.0 ONLY_ON_DEVICE; browser Chrome **157.0.8103.78**, Linux x86_64 on the standard free public Ubuntu runner. Exact model name/revision: **UNKNOWN**. The original receipt's “Browser-managed Gemini Nano” string is an operator label, not a measured model identity. Do not turn a component/download name into an attested model identity.
- Native launch omits sandbox-disabling/performance-bypass flags; this is not blanket OS/GPU sandbox attestation. CSP connect-src none; zero blocked external page requests recorded. Browser-managed model/component downloads are outside page CSP, so this is not zero whole-browser network traffic.
- Initialization/download **64.7999 s**, separate from inference. No cloud call, credentials, deployment, phone work or new evaluation dispatch was performed by this reporting task.

## Detection: 31 successful / 32 planned

One error: **council-03**, exact-quote validation rejected the nonexistent quote council-demo03. Its 29 annotated PII characters are excluded from the importer, not silently treated as a valid empty prediction. All 32 native detector prompts returned; 31 passed application validation.

Character-level micro-averages on the **same 31-notice successful subset only** (1,023 annotated PII characters):

| Detector | Recall | Precision |
|---|---:|---:|
| On-device quote detector | 81.33% (832/1023) | 53.82% (832/1546) |
| Regex, same 31 notices | 38.32% (392/1023) | 55.52% (392/706) |
| Quote detector + regex union | 87.98% (900/1023) | 52.17% (900/1725) |

**No complete 32/32 detector accuracy result.** Full corpus has 1,052 truth characters. The fixed 32-notice offline regex baseline remains 406/1052 recall and 406/730 precision; it must not be mislabeled the same subset. The earlier offset protocol's 0% result used all 32 notices, so this is not a controlled full-corpus before/after comparison. Exact quote matching fixes coordinate derivation, not completeness or semantic precision: e.g. hmrc-01 still redacts its nonpersonal deadline 30 November 2026.

Successful detector outer latency n=31: nearest-rank p50 **4.9488 s**, p95 **7.6382 s**. All attempted detector operations n=32, including the error: p50 **4.8563 s**, p95 **7.6382 s**. Timings include SDK/session and application validation overhead, not pure model compute; no image/OCR measurement.

## Verification: 128 attempted / 128 planned; zero decidable

| Group | Planned / attempted | Accepted | Rejected | Unknown | Error |
|---|---:|---:|---:|---:|---:|
| Authored single-field mutations | 96 / 96 | 0 | 0 | 41 | 55 |
| Unmodified controls | 32 / 32 | 0 | 0 | 13 | 19 |
| Total | 128 / 128 | 0 | 0 | 54 | 74 |

All groups: zero timeout, aborted or not_run. **Observed validated rejections: 0/96 mutations; observed validated false alarms: 0/32 controls. Neither is a reliable semantic catch/false-alarm rate:** every trial is unknown or error, and the decided denominators are **0/96 and 0/32**. Decided-subset catch/false-alarm rates are undefined (importer NOT_RUN), not 0%, 100%, or evidence of accurate acceptance. Unknown/error must never count as rejection. Some unknown rows contain individual unsupported checks, but the collector's documented rule keeps a trial unknown whenever any submitted check is unknown.

All **74 errors** are strict application errors: Nano evidence quote absent from source. Native inference itself returned successfully. Example: trial-000 hmrc-02 amount mutation inserted a newline into an otherwise source-like quote; exact matching refused it. No fuzzy quote repairs, retries or synthesized decisions were added. Verifier native prompt counts per outer trial: 17×1, 47×2, 64×3 = **303**, plus 32 detector prompts = **335** native prompts, all successful and hash-verified, zero native errors. Failed early batches correctly skip later batches. Three claims per trial remain the intended experiment; 335 prompts do not mean 335 independent trials.

All attempted verifier outer latency n=128: nearest-rank p50 **13.1064 s**, p95 **18.3329 s**, including errors/unknowns and serial subcalls. This is not successful-verifier latency or complete product two-key coverage.

## Evidence and reproducibility

[Evidence directory](evidence/quote-eval-43348904459/) preserves the **unchanged 2,133,229-byte receipt** (synthetic originals, exact native prompts/schemas/raw outputs), original proof/manifest/hardware/installation and terminal run metadata, plus successful-subset importer output and independent inspection. Receipt SHA-256: **05c78db27a2fa6c9f9e2a194ccd004395fa13cf93849ad73c2705068e3966b60**. All 73 original manifest entries, all captured prompt/schema hashes and all eight source-byte hashes verified. Screenshots/diagnostics remain in the downloaded local/Actions artifact (7-day retention); the committed manifest lists their hashes, but they are not all duplicated in Git. No screenshot sequence is video; proof explicitly says NOT_RECORDED.

From the repository root at matching source files, with the original complete artifact downloaded:

	node scripts/inspect-quote-eval.mjs /path/to/device-eval-artifacts /path/to/inspection.json
	node scripts/evaluate.mjs import /path/to/device-eval-artifacts/receipt.json

The inspection asserts original manifest bytes, source bytes, native prompt/schema hashes and planned status accounting. Import always needs the coverage/error report alongside it. Offline verification on this branch: CI wiring **3/3**, operator collector **9/9**, corpus **4/4**, operator TypeScript check and inspection-script syntax/hash checks passed. TEST_ONLY tests are not model measurements.

Scope: 32 short authored synthetic notices; three authored candidate fields, not real cloud answers, full explanation/draft checking, real letters, independent device attestation, end-to-end product journey, Android, image/OCR, or demo footage. **Conclusion: quote-only detection produced useful but incomplete/low-precision subset results; verifier remains unusable as an accuracy claim. No production readiness or privacy guarantee.**
