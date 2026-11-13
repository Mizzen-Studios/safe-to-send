# Quote/two-key next candidate — 13 November 2026

Unmeasured candidate based on cfdf98e, not new Nano accuracy or release evidence.

## Actual failures reviewed before editing

Read QUOTE_EVALUATION_2026-11-13.md and the unchanged receipt (SHA-256 05c78db27a2fa6c9f9e2a194ccd004395fa13cf93849ad73c2705068e3966b60). Inspected actual detector council-03: invented council-demo03; verifier hmrc-02: inserted newline between source sentences; nhs-05: invented No monetary amount is stated; tenancy-04: editorial/smart-quote additions. All remain invalid, not repairable evidence. Tenancy-01 contains real full-sentence quotes but its authored claim paraphrases do not prove whole-field textual identity.

Historical 31/32 successful detection subset 81.33% recall / 53.82% precision and verifier 54 unknown / 74 errors / zero decidable remain unchanged. No corpus, truth, mutation or original receipt edits.

## Changes

- Shared quotes-v1 prompt asset now explicitly forbids invented identifiers, sentence joining/newline invention, quoting absence statements or the candidate claim as source evidence. Requests short complete source sentences retaining conditions/negations and empty evidence for uncertainty. Strict quote/schema/ID parsing, no retries/repair/fuzzy matching are unchanged. This guidance needs genuine model validation; stronger wording may still fail.
- Text AND image Nano adapter outputs now apply existing automaticReviewSpans DATE policy, previously only applied by review UI/manual regex suggestions. DOB-labelled dates survive; deadline/appointment DATE findings do not become redactions. Exact raw JSON is preserved locally; parseTextDetection still exposes strict raw spans for protocol tests. Future reported adapter metrics must disclose this deterministic postfilter, not call them raw model-only predictions. Raw regex historical baseline is unchanged. Manual explicit selections remain unaffected. Identity dates without a recognized DOB prefix can be missed; classification errors under other kinds remain possible.
- A tiny typed action comparator can corroborate model mismatch for an exact complete unique source sentence: Pay/Do not pay + GBP amount, or Please reply by/Reply by/Send evidence by + absolute ISO/English date. All literal wording must match; only the one amount/date slot may differ. It requires the whole source sentence as an exact quote. Repeated possible obligations, polarity changes, actor/condition/paraphrase changes, partial/unrelated/greeting quotes and invalid dates stay unknown. GBP pence and valid absolute dates can compare equivalent spellings without repairing evidence. Model-supported equivalent typed actions can pass this narrow guard. It never upgrades unknown/mismatch to supported.
- Bare amount evidence must align to a complete original money token at every quote occurrence; a truncated £25 inside £250 cannot borrow support from a separate £25 elsewhere.

## Deliberate limitations

This is literal scoped comparison, not entailment, broad paraphrase acceptance, legal/advice checking or a truth guarantee. Separate-sentence discourse conditions, attribution and contradictory prose remain beyond the grammar. Whole explanation and draft remain submitted and checked unchanged; narrow action checks do not bypass them or yield product acceptance. Bare amount/deadline objects do not gain broad contradiction inference. Unsupported remains the existing web model verdict, not a proven absence guarantee. A mismatch is a review warning, not a fabricated model decision. Most current corpus paraphrases should still be unknown: do not rewrite the corpus or remove hard claims to raise scores.

Shared Android wire/schema/version remains quotes-v1 and Android packages the same canonical prompt asset. Android suggestions are manual-only, not automatically applied DATE redactions. Its native reviewer remains more conservative whole-line verbatim-only and returns unknown for mismatch/unsupported; web typed semantics are NOT claimed as native parity. Porting typed semantics requires separate native tests/review, not silently changing the shared wire contract. No native device/model inference claimed; actual model identity UNKNOWN unless reported by that actual device.

## Ownership and next gate

Parent owns integration, independent review and any authorized Spark Hosting redeploy; worker performs none. Recommend ONE genuine evaluation after parent integrates and reviews the candidate, preserving original corpus and exact native prompts/raw outputs, complete 32-notice and 128-trial denominators, error/unknown/decidable accounting and exact source hashes. Do not infer success from these TEST_ONLY gates or blindly rerun the prior source. End-to-end full explanation/draft two-key journey remains a separate necessary gate. No cloud infrastructure changes, secret/debug-token reads, paid resources, phone/adb/Mac dependencies or organizer contact.

## Verified offline/local gates

- 239/239 web unit/protocol tests, 20 files, including unchanged real-failure receipt/hash regression and adversarial typed evidence/DATE text-image adapter tests.
- Operator collector TEST_ONLY 9/9; CI wiring 3/3 and Hosting-script offline safety tests 6/6. No deployment executed.
- Web and operator TypeScript checks passed; raw and broker production builds passed; git diff --check passed.
- Android offline test attempted with existing host SDK only: BLOCKED before tests because installed Java 21 runtime lacks JAVA_COMPILER capability. No SDK/JDK installation, device/adb run or native pass claimed. No Android Kotlin source changed.
- Self-inspected diff; independent review remains parent-owned. Genuine Nano inference/evaluation NOT_RUN for this candidate, actual model identity UNKNOWN.
