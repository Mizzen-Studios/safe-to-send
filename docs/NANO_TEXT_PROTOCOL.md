# Nano quote protocol (quotes-v1; unmeasured candidate)

This supersedes the indexed-offset model wire protocol. Prior real metrics and receipts in EVALUATION.md are unchanged. Run 43346787463 is an independent intermediate indexed-protocol diagnostic, **not** proof of this quote candidate. Parent owns the next authorized real 32-letter / 96-mutation rerun.

## Shared wire contract

Canonical assets: [../shared/nano/contract.json](../shared/nano/contract.json) contains prompts and text/image/verifier JSON schemas, imported directly by the web adapter. Android can consume the same JSON asset; it must implement identical strict local matching and bounds, not silently translate legacy schemas. The contract contains no corpus ground truth, mutation labels, variants, expected answers or evaluation IDs.

- Text input: detectionPrompt followed by newline and JSON containing only original.
- Text output: exactly findings, an array of objects containing exactly quote and kind. No transcription or offsets.
- Image output: exactly transcription and findings; findings use the same quote/kind contract, indexed locally against transcription. OCR correctness still requires real image evaluation.
- Verification input: verificationPrompt followed by newline and JSON containing only original and claims (id, kind, value).
- Verification output: exactly checks; each check has exactly id, status and evidence. Each evidence item has exactly quote, **not** start/end. Status remains supported/mismatch/unsupported/unknown.

No indexed token/line tables are sent. The old indexedOriginal export remains an unused mechanical utility for historical test compatibility, not part of current inference inputs. ONLY_ON_DEVICE, initialization and response-provenance checks remain mandatory; there are no cloud parameters or fallbacks.

## Local detection matching

parseTextDetection returns existing internal Span[] (JavaScript UTF-16, end exclusive). Exact source substring matching only: no Unicode normalization, case folding, whitespace repair, punctuation stripping or fuzzy mappings. Every exact occurrence is selected, including overlapping repeats. This deliberately conservatively redacts repeated identical text even if one occurrence has a different semantic role; users review redactions.

Identical duplicate findings are idempotent. Different kinds for the same quote reject the response. Overlap union uses existing validateSpans, with explicit start/end/kind ordering so output order does not change the result. Absent quotes, whitespace-only quotes, split-surrogate boundaries, unknown kinds, extra keys and legacy schemas reject the whole response. No partial success is returned.

Limits: source/transcription 50,000 UTF-16 units; text response 100,000 units; image response 200,000; individual quote 5,000; findings 1,000; expanded matches 1,000 before merging. The last cap prevents repeated-character output from creating unbounded local spans. Text original remains the caller's unchanged string, never a model echo. Raw diagnostic JSON now necessarily contains private quotes and must remain local.

Detection prompt explicitly preserves due/deadline/appointment dates by default; DATE is for personal DOB/identity contexts. Prompt guidance is not a deterministic guarantee of detector recall or classifications.

## Two-key integration interface (B3 handoff)

nano.verify returns **quote-only JSON unchanged**, not fabricated offsets or rewritten statuses. validateQuoteVerification checks exact keys, bounded response/evidence, complete exact IDs, and exact source occurrence before each batch and after aggregation. Existing up-to-three serial contiguous batches remain; all whole explanation, whole draft, action, amount and deadline claims supplied by the caller are preserved. Missing/extra/duplicate IDs are never synthesized or repaired. A failed batch stops later batches.

**B3 must update hybrid.ts parseVerification to consume evidence [{quote:string}] and assess evidence relevance to the matching claim**, retaining strict IDs and whole explanation/draft/action coverage. This branch intentionally does not edit hybrid.ts. At the base commit its offset consumer conservatively downgrades quote-only positive evidence to unknown; adapter contract tests passing here do not prove integrated supported decisions. Merge B3 before the real evaluation.

Exact occurrence is evidence provenance, **not** proof of the claim. The shared prompt requires assessment of the entire matching claim, actors/actions/amount/date/conditions/negations, and explicitly forbids a real but unrelated quote as support or contradiction. The validator returns void, never a fabricated semantic verdict; final verdict remains the hybrid consumer's job. Prompt instructions and local relevance guards are not an accuracy guarantee. Real verifier catch rate must be measured, including unrelated-quote adversarial cases.

## Local gates

SDK/native injections in unit and operator tests are TEST_ONLY, not model inference. Collector assertions track the new original-only prompts, quote schemas and exact-ID batches; collection/import format remains internal Span[] plus unchanged raw output receipts. Baseline corpus/regex/evidence assets are untouched. No deployment, resources, credentials or real model dispatch are part of this change.

Final local gates: 185 tests in tests/ pass; 9 operator collector tests pass; 3 node:test CI wiring checks pass; TypeScript and both production builds pass; git diff --check passes. All SDK/native fixtures are TEST_ONLY. Chrome capability.modelIdentity and nano.modelIdentity report {reportedName:null,status:"UNKNOWN_NOT_EXPOSED",source:"Chrome Prompt API"}; no exact Nano version is inferred from Chrome/component/cloud aliases.
