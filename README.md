# Safe to Send

**Understand the letter. Keep control of what leaves your browser.**

A stressful tax, benefits, NHS or housing letter should not require pasting your identity into a chatbot. Safe to Send offers a different journey: find personal details locally, review the redactions, approve the exact payload, then get a plain-English explanation, important dates, next actions and an editable reply.

**[Try the live synthetic build](https://safe-to-send-2026.web.app)** · [Measured evaluation](docs/EVALUATION.md) · [Real cloud evidence](docs/evidence/deployed-cloud-cdp-ledger.json)

> **Final no-Pixel entry scope — synthetic letters only.** [Current evidence package](submission/CURRENT_EVIDENCE_2026-11-25.md) is authoritative. Real desktop Chrome ONLY_ON_DEVICE detection, reviewed redaction and local answer execution completed; checks remain **UNKNOWN**, and the preserved reply has a wrong-direction error requiring human rewrite. Separate Android emulator approved-cloud footage uses **DEVELOPMENT App Check**, Nano unavailable; separate genuine web cloud acceptance is documented. No continuous hybrid journey or normal production App Check acceptance is claimed. **Physical devices not evaluated / out of scope for this entry.** Final verifier: **14/128 planned, 14/72 attempted decided; 57 unknown, 1 aborted, 56 not run. Target FAILED.** Experimental warning-or-unknown only. All32 adapter character recall **90.02%**, precision **69.58%**; not a privacy guarantee. Model identity **UNKNOWN_NOT_EXPOSED**. Historical desktop-cloud acceptance has no available private video. Do not enter real personal information.

![Actual local product flow: synthetic templates, not Nano or cloud inference](docs/media/product-preview.gif)

*Captured from the real local UI; the response is an explicitly labelled deterministic synthetic template, not model inference. [Capture receipt](docs/evidence/product-preview.json).*

**Deployment status:** owner-authorized Spark Hosting releases follow passing tests and artifact/token scans. See [release gates](docs/DEPLOYMENT.md). Native App Check is configured; normal production-token acceptance is not proven. Physical devices not evaluated / out of scope for this entry.

## Try it in under five minutes

Node 24.12+; no card, account, API key or model download needed for the **local preview** (installation time depends on your connection).

```sh
git clone https://github.com/Mizzen-Studios/safe-to-send.git
cd safe-to-send
npm ci
npm run dev
```

Open http://localhost:5192. Choose a synthetic sample, select **Use sample annotations (not AI)** or **Review redactions manually**, edit the marked details, confirm synthetic input and exact-payload review, approve the redacted JSON, then choose the labelled local example. Edit/download the draft. Changing the source or redactions invalidates approval. Local preview needs no Firebase configuration. Release builds bundle strictly allowlisted public Firebase metadata without a config-paste screen; private input files and debug tokens are never committed. Configured release builds need no judge setup; the deployed commit is reported with each verified Hosting release. Source checkout uses a key-free local preview unless release metadata is supplied. Supported-device model initialization/download is a separate research step, not part of the five-minute preview.

## Why hybrid, not “upload and hope”?

![Architecture: raw browser origin separated from approved-redacted Firebase broker](architecture.svg)

Firebase AI Logic (`firebase/ai`) is the runtime: an explicit **ONLY_ON_DEVICE** image/text + JSON-schema adapter for detection, and a separate **ONLY_IN_CLOUD** structured explanation adapter. There is no raw-content automatic cloud fallback. The implementation and evidence map to the four equal judging criteria:

1. **Technological implementation of hybrid inference:** explicit local detection plus product patterns; immutable reviewed redacted cloud requests; local-only answers and experimental warning-or-unknown checks. Desktop execution and separate emulator/web cloud evidence do not prove one continuous hybrid journey. Final measured verdict is 14/128 planned decided, not reliable verification; see [final evaluation](docs/FINAL_WEB_VERDICT_2026-11-15.md).
2. **Design:** letter-first paste/select/drop flow, highlighted editable redactions, explicit approval, explanation and editable/exportable draft. Saved results/reminder dates use optional local-only IndexedDB; reminders require the app open. Technical panels live in Evidence.
3. **Potential impact:** calmer official correspondence without uploading the original. Manual mode lowers the device barrier. Redaction can miss details; users must review what they send, and check advice against the original.
4. **Idea quality:** the two-key design checks cloud claims against the private original on device, while the exact-body ledger makes the cloud boundary inspectable. It is a model-supported warning mechanism, not a truth guarantee or compliance certification. Spark/free-tier constraints and no paid fallback remain.

[Boundary implementation](docs/CLOUD_HANDOFF.md) · [Supported-device gates and recording plan](docs/DEVICE_TESTING_AND_RECORDING.md) · [Firebase hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

## What is actually proven?

- **Local product flow:** review, explicit immutable-payload approval, structured templates, local restoration, draft editing/export and invalidation; [browser QA](docs/evidence/reviewed-journey-browser.json). Templates and mocks are not model execution.
- **One real deployed cloud test:** gemini-3.5-flash-lite through AI Logic with registered private debug App Check. Independent DevTools/CDP body and ledger match: **1766 UTF-8 bytes + SHA-256**; five known HMRC synthetic PII sentinels absent from observed outbound URLs/bodies. [Body-only receipt](docs/evidence/deployed-cloud-cdp-ledger.json) · [ledger capture](docs/evidence/deployed-cloud-ledger.png). Not TLS-byte measurement or a general privacy/semantic-correctness guarantee.
- **Custom manual cloud journey, private candidate:** real AI Logic response after exact-payload approval; independent CDP/ledger parity for **2,167 UTF-8 bytes**, both known synthetic identifiers absent from observed outbound requests. [Body-only receipt](docs/evidence/manual-candidate-cloud-cdp.json). Uses debug App Check and browser-served candidate assets, **not a deployed release or Nano proof**. Reply addressing is reconstructed locally, rather than trusting model-invented roles.
- **App Check negative control:** valid client key without App Check rejected **401**; [receipt](docs/evidence/appcheck-negative-control.json). Non-debug Enterprise attestation remains unverified: [browser launch blocker](docs/evidence/enterprise-attestation-launch-blocker.json).
- **Real Nano smoke proof:** native sandboxed Chrome 157 on a standard free Ubuntu runner passed text, image/schema and Firebase ONLY_ON_DEVICE. No performance bypass. [Result and per-channel limitations](docs/evidence/nano-native-smoke-result.json) · [CPU broker screenshot](docs/evidence/nano-native-cpu-broker.png). Smoke-stage timings are not corpus latency.
- **32 synthetic evaluation notices:** six each HMRC/DWP/NHS/council/tenancy, one non-UK and a PII-free negative control. Measured regex character recall **38.59% (406/1052)**, precision **55.62% (406/730)**. Warm Node regex-only per-notice latency: p50 **0.00852 ms**, p95 **0.01056 ms** (not browser performance). The first historical text evaluation (before subsequent quote fixes) completed with Nano recall/precision **0%/0%**; union recall **38.59%**, precision **41.90%**. Subsequent full-32 quote-adapter measurements are [reported separately](docs/FIXED_VERDICT_EVALUATION_2026-11-15.md); that historical run decided only 3/128 verifier trials; the final run decided 14/128 planned trials, so no credible general catch-rate claim. [Measured failures and denominators](docs/EVALUATION.md). [Corpus, 96 authored claim mutations, importer and limitations](docs/EVALUATION.md).

```sh
npm test
npm run build
node scripts/evaluate.mjs regex
```

The original five UI fixtures stay unchanged; `npm run eval` still measures that smaller spike. Expanded evaluation is not a cloud-send allowlist. No perfect recall, anonymity, legal advice or policy-compliance promise. IndexedDB history/reminders are implemented and browser-tested; supported-device smoke inference passed; desktop local execution completed with UNKNOWN checks and poor reply direction; physical devices are out of scope. The product GIF shows actual local UI/template behavior only. Genuine desktop local footage is available in the current package; the linked ledger capture is separate real synthetic cloud evidence.

## Built during the submission period—history disclosed

A solo entry by **Olly**, developed with AI coding assistance. Mizzen Studios is the repository organization and retained copyright attribution, not an additional entrant or team member. Organization/entry presentation needs owner review; no organization change or eligibility claim is implied.

Owner-supplied start: **11 November 2026, 21:30 UK (21:30 UTC)**. Deadline: **30 November 2026, 22:00 UK**. Rules and eligibility require owner review; these dates are owner-provided, not independent eligibility clearance.

A **9 November preparatory spike predates the start**: `20ab95e`, `052a9b0`, `aefd5f4`, `8d5b919`, `9b1ffd3`. It covered privacy gates, five fixtures and the blocked on-device adapter—not explanation/deadlines/actions/drafts or real cloud inference. History/dates are unchanged.

Factual post-start milestones (12 November):
- `ece481f` / `6384297`: mandatory reviewed synthetic explanation/date/action/draft flow and fail-closed preflight/invalidation.
- `447f318` / `06b7c0e`: isolated two-origin handoff, immutable approved bytes, structured cloud SDK path and synthetic-only scope guards.
- `cfbf5cc`: actual deployed debug-App-Check inference and independent DevTools/ledger parity.
- `a096591`: headed Nano eligibility blocker and operator-owned device/recording plan.
- `fd8e434`: 32-notice corpus, offline measured regex scoring and real-output import contract (no model calls).

- `a42b88f`: allowlisted public device metadata build bundle.
- `2044b8d` / `8d670df`: manual-review and revision-bound local-answer/two-key APIs, sender/recipient roles.
- `5fc8405` / `3d913f2` / `8763bb6`: product-first UI, IndexedDB history and keyboard/mobile/drag-drop QA.
- `03a5fd2` / `0c0968a`: free x64 channel variants: native Ubuntu Stable passed real Nano CPU inference; Dev reported a disabled execution feature gate; Windows installation needs repair ([latest receipt](docs/evidence/nano-native-smoke-result.json)).

[Full provenance, SDK/runtime caveats and preserved audit links](docs/EVALUATION.md#existing-audit-trail-preserved-from-baseline-a096591). This branch does not deploy, alter DNS/resources, submit or post publicly. Operator owns device tests/recording; the owner need not run setup. Apache-2.0 · [prior attribution](NOTICE).
