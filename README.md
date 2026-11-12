# Safe to Send

**Understand the letter. Keep control of what leaves your browser.**

A stressful tax, benefits, NHS or housing letter should not require pasting your identity into a chatbot. Safe to Send explores a different journey: find personal details locally, review the redactions, approve the exact payload, then get a plain-English explanation, important dates, next actions and an editable reply.

**[Try the synthetic research build](https://safe-to-send-2026.web.app)** · [Measured evaluation](docs/EVALUATION.md) · [Real cloud evidence](docs/evidence/deployed-cloud-cdp-ledger.json)

> **Synthetic letters only.** Real Nano execution is still blocked by device availability. The working local journey uses explicitly labelled templates—not AI. The separate real cloud milestone used registered private debug App Check; it does not prove non-debug Enterprise attestation or a complete on-device-to-cloud journey. Do not enter real personal information.

## Try it in under five minutes

Node 24.12+; no card, account, API key or model download needed for the **local preview** (installation time depends on your connection).

```sh
git clone https://github.com/Mizzen-Studios/safe-to-send.git
cd safe-to-send
npm ci
npm run dev
```

Open http://localhost:5192. Choose **Try the synthetic review journey (no AI)**, review/edit the marked details, confirm your review, approve the exact redacted JSON, then generate the labelled local example. Edit/download the draft. Changing the source or redactions invalidates approval. Local preview needs no Firebase configuration. Public Firebase project metadata bundling is parent-owned integration work; this branch does not include a key or claim keyless live-model setup. Supported-device model initialization/download is a separate research step, not part of the five-minute preview.

## Why hybrid, not “upload and hope”?

![Architecture: raw browser origin separated from approved-redacted Firebase broker](architecture.svg)

Firebase AI Logic (`firebase/ai`) is the runtime: an explicit **ONLY_ON_DEVICE** image/text + JSON-schema adapter for detection, and a separate **ONLY_IN_CLOUD** structured explanation adapter. There is no raw-content automatic cloud fallback. The design ladder has four criteria:

1. **Privacy:** raw source/image and placeholder mapping stay in the raw browser origin. Only reviewed redacted JSON may cross the boundary. Missing PII remains a risk; review is not a guarantee.
2. **Capability:** local Nano handles detection; cloud handles explanation/draft after approval. A strict synthetic-source lock currently refuses arbitrary or Nano-derived cloud sends.
3. **Availability and latency:** unsupported device, interrupted download or failed detection blocks that route, not a silent upload. Real Nano/combined accuracy and latency remain **NOT_RUN**. Local deterministic preview stays usable.
4. **Cost and trust:** Spark only, billing disabled/unlinked in the recorded infrastructure receipt; no card/Blaze/paid-resource upgrade. Broker App Check plus exact SDK-body ledger makes a send inspectable. No always-on inference or paid fallback.

[Boundary implementation](docs/CLOUD_HANDOFF.md) · [Supported-device gates and recording plan](docs/DEVICE_TESTING_AND_RECORDING.md) · [Firebase hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

## What is actually proven?

- **Local product flow:** review, explicit immutable-payload approval, structured templates, local restoration, draft editing/export and invalidation; [browser QA](docs/evidence/reviewed-journey-browser.json). Templates and mocks are not model execution.
- **One real deployed cloud test:** gemini-3.5-flash-lite through AI Logic with registered private debug App Check. Independent DevTools/CDP body and ledger match: **1766 UTF-8 bytes + SHA-256**; five known HMRC synthetic PII sentinels absent from observed outbound URLs/bodies. [Body-only receipt](docs/evidence/deployed-cloud-cdp-ledger.json) · [ledger capture](docs/evidence/deployed-cloud-ledger.png). Not TLS-byte measurement or a general privacy/semantic-correctness guarantee.
- **App Check negative control:** valid client key without App Check rejected **401**; [receipt](docs/evidence/appcheck-negative-control.json). Non-debug Enterprise attestation remains unverified: [browser launch blocker](docs/evidence/enterprise-attestation-launch-blocker.json).
- **32 synthetic evaluation notices:** six each HMRC/DWP/NHS/council/tenancy, one non-UK and a PII-free negative control. Measured regex character recall **38.59% (406/1052)**, precision **55.62% (406/730)**. Nano, combined, latency and two-key model catch rate: **NOT_RUN**. [Corpus, 96 authored claim mutations, importer and limitations](docs/EVALUATION.md).

```sh
npm test
npm run build
node scripts/evaluate.mjs regex
```

The original five UI fixtures stay unchanged; `npm run eval` still measures that smaller spike. Expanded evaluation is not a cloud-send allowlist. No perfect recall, anonymity, legal advice or policy-compliance promise. IndexedDB history/reminders and supported-device inference proof remain future work. No genuine Nano GIF is supplied because it has not run; the linked ledger capture is real synthetic cloud evidence, not an invented demo.

## Built during the submission period—history disclosed

Owner-supplied start: **11 November 2026, 21:30 UK (21:30 UTC)**. Deadline: **30 November 2026, 22:00 UK**. Eligibility/rules are not independently cleared; the official rules fetch returned 403 and was not bypassed.

A **9 November preparatory spike predates the start**: `20ab95e`, `052a9b0`, `aefd5f4`, `8d5b919`, `9b1ffd3`. It covered privacy gates, five fixtures and the blocked on-device adapter—not explanation/deadlines/actions/drafts or real cloud inference. History/dates are unchanged.

Factual post-start milestones (12 November):
- `ece481f` / `6384297`: mandatory reviewed synthetic explanation/date/action/draft flow and fail-closed preflight/invalidation.
- `447f318` / `06b7c0e`: isolated two-origin handoff, immutable approved bytes, structured cloud SDK path and synthetic-only scope guards.
- `cfbf5cc`: actual deployed debug-App-Check inference and independent DevTools/ledger parity.
- `a096591`: headed Nano eligibility blocker and operator-owned device/recording plan.
- `8d9a272`: 32-notice corpus, offline measured regex scoring and real-output import contract (no model calls).

[Full provenance, SDK/runtime caveats and preserved audit links](docs/EVALUATION.md#existing-audit-trail-preserved-from-baseline-a096591). This branch does not deploy, alter DNS/resources, submit or post publicly. Operator owns device tests/recording; the owner need not run setup. Apache-2.0 · [prior attribution](NOTICE).
