# Devpost description — draft, not submitted

## Safe to Send
**Understand the letter. Review what leaves your device.**

### Inspiration
A tax, benefits, NHS or housing letter can be hard to understand. Asking for help should not begin by pasting the original into a chatbot. Safe to Send explores a deliberate workflow: identify personal details locally, review them yourself, then approve exactly what the cloud receives.

### What it does
This experimental **synthetic_only** prototype accepts made-up letter text, supports manual redaction review, and shows an immutable redacted payload before approval and sending. A structured explanation can provide dates, next actions and an editable reply. Original details can be restored locally. Editing the source or redactions revokes approval. Local example responses are labelled templates, not AI.

Human review is mandatory: detection misses details and over-redacts. This is not an anonymity guarantee, legal advice or a production service for real correspondence.

### How we built it
The web app uses TypeScript/Vite and Firebase AI Logic. Detection requests ONLY_ON_DEVICE; a separate ONLY_IN_CLOUD adapter receives only the approved redacted payload. No raw-original automatic cloud fallback. A separate browser origin brokers cloud requests and exposes a body-byte/hash ledger. Experimental local warning-or-unknown checks compare proposed claims with the private original; they do not reliably verify answers. Android implementation is a parallel lane, not physical Pixel proof.

See [architecture](ARCHITECTURE.html), [cloud boundary](../docs/CLOUD_HANDOFF.md) and [evaluation](../docs/FIXED_VERDICT_EVALUATION_2026-11-15.md).

### What is demonstrated, and what is not
- Actual local browser review/template behavior has a [browser receipt](../docs/evidence/reviewed-journey-browser.json); templates are not inference.
- A separate [real deployed cloud test](../docs/evidence/deployed-cloud-cdp-ledger.json) used private debug App Check. Independent DevTools observation matched the ledger's **1,766 UTF-8 HTTP-body bytes** and SHA-256; five known synthetic PII sentinels were absent from observed outbound URLs/bodies. This is scoped evidence, not universal privacy, TLS-wire measurement, production attestation or an end-to-end Nano journey.
- Genuine desktop Nano smoke inference and a synthetic evaluation exist separately. On **all 32 notices**, including one partial response, the **production redaction adapter** scored character recall **990/1052 (94.11%)** and precision **990/1383 (71.58%)**. These are not Android results, raw-model accuracy, field-level accuracy or guarantees. The 31-clean subset is a different denominator (95.34%/71.55%); it must not replace the all-32 result.
- Local checking decided only **3/128** attempted authored trials: one mutation rejected, two controls accepted, **125 unknown**. The deadline rejection came from deterministic typed grounding despite Nano saying MATCH. No “100% safe,” reliable-verifier or general catch-rate claim is justified.
- Physical Pixel inference and VM-to-Pixel wireless access are **NOT_RUN**. Normal production attestation and a complete physical-device hybrid journey remain unverified. New video slots stay **EXPECTED_NOT_CAPTURED** until independently verified assets arrive.

### Challenges and learning
Testing the actual runtime mattered: server-side SDK behavior cannot substitute for browser-only local inference. Exact-quote grounding made unsupported output explicit, but low decided coverage required us to scale back verifier claims. Useful interface behavior, mocks, separate real cloud proof and genuine local inference must not become an invented end-to-end success.

### Accomplishments
A reviewable privacy boundary, revision-bound approval, inspectable cloud ledger, editable local draft and evidence preserving failed acceptance results. The useful result is control and visibility—not a promise that AI never makes mistakes.

### What's next
Finish authorized device validation, improve evidence completeness without weakening unknown handling, and replace planned shots only with genuine recordings. Real-user deployment and public release are not authorized by this draft.

### Entrant, provenance and licence
Solo entrant: **Olly**, with AI coding assistance. Mizzen Studios is the repository organization/copyright attribution, not another entrant. A preparatory spike on **9 November 2026** predates the owner-supplied hackathon start of **11 November 2026, 21:30 UTC**. Preserved spike commits: 20ab95e, 052a9b0, aefd5f4, 8d5b919, 9b1ffd3. It implemented privacy gates, five fixtures and a blocked local adapter. Post-start work substantially added reviewed explanations/dates/actions/drafts, dual-origin approval/handoff, real synthetic cloud testing, expanded evaluation and local inference work. See [preserved provenance](../README.md#built-during-the-submission-periodhistory-disclosed).

Actual licence: [Apache-2.0](../LICENSE), with prior MIT attribution retained in [NOTICE](../NOTICE). [Official hackathon rules](https://firebasehybridaihackathon.devpost.com/rules) govern eligibility and reuse; owner must review current rules and disclosures before submission. This is not eligibility clearance. No entry, organization, hosting or public-release changes were made.
