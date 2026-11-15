# Final experiment: target failed, verifier remains experimental

One authorized Ubuntu Stable run [43729893443](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43729893443), measured source `9ccf4aab94122b682b630f2a25553099f7809221`, reached terminal **failure**. The unchanged 45-minute collection deadline stopped the active operation. No rerun, cap increase, quote repair or corpus changes.

## All planned denominators

- Detectors **32/32 successful**, zero errors/timeouts/not-run. Two invalid findings were omitted without repair; both notices and their misses remain in scoring. Full-32 UTF-16 adapter recall **947/1052 = 90.02%**, precision **947/1361 = 69.58%**; FP414, FN105. These are synthetic adapter character counts, not real-letter accuracy. Previous full-32 run was 94.11% /71.58%; do not claim improved redaction.
- Verifiers **128 planned, 72 attempted**: **3 accepted, 11 rejected, 57 unknown, 1 aborted, 56 not run**, zero errors/timeouts. Decided **14/128 = 10.94% planned**, **14/72 = 19.44% attempted**. The target **64/128 (50%) failed**.
- Mutations96 planned/53 attempted:11 rejected,42 unknown,43 not run; zero accepted. Controls32 planned/19 attempted:3 accepted,15 unknown,1 aborted,13 not run; zero rejected. Unknown/unrun are not successful catches or correct decisions.
- Deadline mutations32:7 rejected,11 unknown,14 not run. Amount mutations32:4 rejected,16 unknown,12 not run. Action mutations32:0 rejected,15 unknown,17 not run. Tiny decided subsets are not full-corpus accuracy or proof of safety.

The single-hypothesis run exposed some independently grounded literal deadline/amount mismatches, but this uncontrolled comparison does not establish that cross-claim mixing improved. Evidence relevance, fabricated quotes, action support and latency still fail. **30 returned checks had absent-source quotes** and stayed uncertain. No weakened evidence acceptance, no labels in prompts, unchanged whole explanation/draft claim coverage. The shared wire schema/statuses/Kotlin contract were not changed.

## Provenance and latency

Independent offline replay verified **103 manifest entries**, embedded source hashes, exact production prompts/schemas, submitted IDs, corpus hash, coverage and adapter decisions. Receipt1,731,293 bytes SHA256 `5a2dc3a8eb46fa438fb0d5a91cf05404e2ac2cc08faf58119aa28805efe2c967`. Complete artifact stays local and in Actions seven-day retention; committed receipt/proof/manifest/independent summary preserve raw synthetic outputs. Manifest includes screenshot hashes; screenshots are not video.

Model identity **UNKNOWN**, no exact model-name API. Real native Chrome Prompt API via Firebase13.2.0 ONLY_ON_DEVICE on free Ubuntu Stable, CSP connect-src none, zero blocked page requests, proof errors0. Browser-managed downloads are outside page CSP; no independent OS/GPU/model attestation. Chrome157.0.8103.78. Exactly246 native prompts:32 detector +214 verifier, including one aborted native prompt; one native abort error is retained, not confused with zero outer harness error statuses. There were71 completed three-call verifier trials, one aborted first-call trial,56 unstarted trials. Initialization65.160s; detector p50 10.872s/p95 16.280s (n32), attempted verifier p50 31.600s/p95 35.741s (n72, includes aborted call). SDK/session/validation wall-clock, not pure model compute.

## Product decision now

**No reliable-verifier headline; experimental local warning-or-unknown only.** UI now shows the failed final denominators, mandatory manual review and no verification/anonymity/accuracy guarantee. No waiting until18November. Cloud-only remains local manual redaction plus exact approved-payload cloud help, never raw-cloud fallback. Genuine accepted private-development-AppCheck cloud browser proof is separate from this local inference experiment. Hosting integration/deployment belongs to parent; no deployment performed.
