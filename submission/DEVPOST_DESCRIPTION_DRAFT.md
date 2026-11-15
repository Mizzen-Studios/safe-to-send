# Devpost description — draft, not submitted

## Safe to Send
**Human-controlled redaction. Inspect what leaves your device.**

### Inspiration
A tax, benefits, NHS or housing letter can be hard to understand. Asking for help should not begin by pasting the original into a chatbot. Safe to Send explores a deliberate workflow: identify personal details locally, review them yourself, then approve exactly what the cloud receives.

### What it does
This experimental **synthetic_only** prototype accepts made-up letter text, supports manual redaction review, and shows an immutable redacted payload before approval and sending. A structured explanation can provide dates, next actions and an editable reply. Original details can be restored locally. Editing the source or redactions revokes approval. Local example responses are labelled templates, not AI.

Human review is mandatory: detection misses details and over-redacts. This is not an anonymity guarantee, legal advice or a production service for real correspondence.

### How we built it
The web app uses TypeScript/Vite and Firebase AI Logic. Detection requests ONLY_ON_DEVICE; a separate ONLY_IN_CLOUD adapter receives only the approved redacted payload. No raw-original automatic cloud fallback. A separate browser origin brokers cloud requests and exposes a body-byte/hash ledger. Experimental local warning-or-unknown checks compare proposed claims with the private original; they do not reliably verify answers. Android implementation is a parallel lane, not physical Pixel proof.

See [architecture](ARCHITECTURE.html), [cloud boundary](../docs/CLOUD_HANDOFF.md) and [evaluation](../docs/FINAL_WEB_VERDICT_2026-11-15.md).

### What is demonstrated, and what is not
- Actual local browser review/template behavior has a [browser receipt](../docs/evidence/reviewed-journey-browser.json); templates are not inference.
- The [actual desktop recording](../docs/submission/DESKTOP_FOOTAGE.md) is 45.53 seconds, silent and unedited: Firebase ONLY_ON_DEVICE detection plus product regex union highlighted five known synthetic private values. This does not isolate model contribution. Local explanation **failed closed**, with no fallback or rendered draft. Model identity: **UNKNOWN_NOT_EXPOSED**. Cloud send was not clicked.
- Separate [genuine web cloud proof](../docs/evidence/final-web-real-cloud-2026-11-15.json) accepted a structured response: **2,515 UTF-8 SDK HTTP-body bytes** matched the ledger hash. Known synthetic identifiers were absent from observed requests. This used private development App Check, **not normal production attestation**, TLS-wire measurement or a continuation of the desktop clip. The earlier [1,766-byte receipt](../docs/evidence/deployed-cloud-cdp-ledger.json) remains history for a different request.
- Final **all32** detector evaluation: adapter character recall **947/1052 = 90.02%**, precision **947/1361 = 69.58%**, FP414/FN105; two invalid findings omitted without repair. All32 detectors completed. Synthetic production-adapter character metrics are not raw-model, field-level, Android or amount accuracy.
- Final verifier: **128 planned, 72 attempted, 14 decided** (11 rejected mutations, 3 accepted controls), **57 unknown, 1 aborted, 56 not run**. Coverage **14/128 = 10.94%** planned / **14/72 = 19.44%** attempted. Rejections: **7 deadline, 4 amount, 0 action**; no mutation accepted. The **64/128 target failed**. Unknown, aborted and unrun trials are not correct decisions. No reliable-verifier or general accuracy/catch-rate claim.
- Prior [3/128-decided run](../docs/FIXED_VERDICT_EVALUATION_2026-11-15.md) and all32 **94.11% recall / 71.58% precision** remain history, not final results. Detector output varies; this uncontrolled comparison is **not controlled improvement**, and final detection scores are lower. Amount rejections do not establish Nano amount accuracy.
- The [evidence index](EVIDENCE_INDEX.json) binds files, source commits, hashes and limitations. Labelled emulator footage is **partial manual-redaction/preview/request-attempt footage**, not accepted-cloud footage, Nano proof or a physical Pixel. A separate acceptance receipt is not visually established by this clip and is not imported as its outcome.
- Physical Pixel inference and VM-to-Pixel wireless access are **NOT_RUN**; ARM64 host / x86-64 adb incompatibility remains blocked. Full emulator take (worker93aad), complete physical hybrid journey and normal production attestation remain **EXPECTED_NOT_CAPTURED / NOT_CAPTURED**. No manufactured completion.

### Challenges and learning
Testing the actual runtime mattered: server-side SDK behavior cannot substitute for browser-only local inference. Exact-quote grounding made unsupported output explicit, but low decided coverage required us to scale back verifier claims. Useful interface behavior, mocks, separate real cloud proof and genuine local inference must not become an invented end-to-end success.

### Accomplishments
A reviewable privacy boundary, revision-bound approval, inspectable cloud ledger, editable local draft and evidence preserving failed acceptance results. The useful result is control and visibility—not a promise that AI never makes mistakes.

### What's next
Finish authorized device validation, improve evidence completeness without weakening unknown handling, and replace planned shots only with genuine recordings. Real-user deployment and public release are not authorized by this draft.

### Entrant, provenance and licence
Solo entrant: **Olly**, with AI coding assistance. Mizzen Studios is the repository organization/copyright attribution, not another entrant. A preparatory spike on **9 November 2026** predates the owner-supplied hackathon start of **11 November 2026, 21:30 UTC**. Preserved spike commits: 20ab95e, 052a9b0, aefd5f4, 8d5b919, 9b1ffd3. It implemented privacy gates, five fixtures and a blocked local adapter. Post-start work substantially added reviewed explanations/dates/actions/drafts, dual-origin approval/handoff, real synthetic cloud testing, expanded evaluation and local inference work. See [preserved provenance](../README.md#built-during-the-submission-periodhistory-disclosed).

Actual licence: [Apache-2.0](../LICENSE), with prior MIT attribution retained in [NOTICE](../NOTICE). [Official hackathon rules](https://firebasehybridaihackathon.devpost.com/rules) govern eligibility and reuse; owner must review current rules and disclosures before submission. This is not eligibility clearance. No entry, organization, hosting or public-release changes were made.
