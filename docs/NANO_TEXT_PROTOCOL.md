# Nano text protocol repair (unmeasured candidate)

Base: 291947e0e3c7cdd1623485e1677095bb4d62954d. This is a production adapter/prompt change, not a new model measurement.

## Failure motivating the change

Real run 43339470805 returned all 160 native prompts without native errors, but detector character TP was 0/1052 and every predicted character lay in the synthetic heading. Verifier structural failures were 78 one-check and five two-check responses to three-claim requests. Local inspection receipt: workspace .openclaw/tmp/safe-send-eval-run-43339470805/inspection-summary.json; underlying receipt SHA-256 07a2fc2d574b5b159868f839f76da2f9dbcc37250f28dcd63369b35a21389cba. These failures remain the latest actual measurement; no improved accuracy or timing is claimed here.

## Input/output

Text detection now supplies the unchanged original, its UTF-16 length, mechanically indexed non-whitespace tokens (start/end/text), and nonempty line start/end offsets. Tables are constructed solely from the supplied source, without regex PII classifications, corpus labels, expected answers, mutation types, or evaluation IDs. All JSON values are explicitly untrusted source data, not instructions. Token text is INPUT ONLY.

Text OUTPUT remains exactly an object with spans, each containing numeric start/end and a schema kind. No transcription, original words, token text, quotes, or letter echo are allowed. Numeric example spans were removed to avoid example-offset anchoring. The existing exact-key, bounded-count/size, integer, range, kind and UTF-16 surrogate-boundary parser is unchanged. Tables guide selection but are not a detection oracle or a deterministic privacy guarantee.

Verifier uses the same source indexing, with a per-request schema enumerating only the batch's exact claim IDs and setting checks minItems=maxItems=batch size. Up to three serial calls cover every submitted claim: one claim per call for requests of up to three; larger requests use contiguous batches of ceil(N/3). Whole explanation and draft claims are neither trimmed nor omitted. Each response passes the existing strict parseVerification before aggregation; the aggregate passes it again. Missing, duplicate, invented or extra IDs are never repaired or filled. Existing evidence validation/downgrades are unchanged, and original evidence remains present for the final strict consumer parse; a supported label with invalid evidence still becomes unknown, not supported.

## Tradeoffs and gates

- Indexed tokens repeat source words locally and increase prompt size. Whitespace-token boundaries may include punctuation; whole-line boundaries allow address/evidence selection. Model semantic recall, exact entity endpoints, prompt-injection resistance and context-limit behaviour still require real evaluation.
- Three serial sessions/calls increase verifier latency and repeat the source up to three times on device. Approximately 15 seconds is a budget hypothesis, not a result. The existing evaluator's 60-second timeout remains unchanged. Product N > 3 still requires multiple checks per batch; strict validation intentionally continues to fail closed on omissions.
- ONLY_ON_DEVICE, successful initialization, device response provenance, no cloud params/fallback, image protocol and whole-field privacy coverage are preserved. No harness, UI, hybrid, journey, CI, deployment or resources changed.
- New regression fixtures are SDK MOCKS/TEST_ONLY and test contracts, not real inference.

## Local verification

npx vitest run tests --maxWorkers=1: 176 passing (existing 165 plus 11 focused protocol regressions). npx tsc --noEmit and npm run build (both production builds) pass. git diff --check passes.

Bare npm test also discovers operator tests outside tests/: the existing node:test ci.test.mjs is not a Vitest suite, and the collector native-adapter test fails identically on unchanged base 291947e in this Node environment (zero native calls, mocked fetch rejects SDK transport). Its existing hardcoded 160-call/static-schema assertions will additionally need a separately authorized harness-test update for three-call verification and request-specific schemas. No harness edits were made in this scope. Parallel test invocations intermittently hit an unrelated offline benchmark stdout JSON parse failure; full tests/ passed both on a parallel rerun and on the final serial gate, including both benchmark tests.

Next gate: parent review and authorized real rerun on the already working free Ubuntu Stable CPU route. No model rerun, push, dispatch, or publication was performed by this change.
