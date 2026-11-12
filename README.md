# Safe to Send

A private-first helper for stressful UK official letters. **Research build, synthetic letters only.** A preparatory spike predates the owner-supplied submission period; see the explicit provenance below.

**Previously deployed November 9 spike (not the current source milestone):** https://safe-to-send-2026.web.app

Hosting verified against all three build files byte-for-byte, with no page errors or external requests in the tested synthetic preview. [Deployment evidence](docs/evidence/hosting-verification.json). Billing remains disabled with no linked billing account. This is not a successful Nano inference result.

## Run in under five minutes

Node 24.12+ (verified with Node 24.22.1; required by current Firebase SDK). No account, card, API key or model download needed for the local preview.

```sh
git clone https://github.com/Mizzen-Studios/safe-to-send.git
cd safe-to-send
npm ci
npm test
npm run dev
```

Open http://localhost:5192. `npm run build` typechecks and builds the static site; `npm run eval` reports the five-letter regex baseline. Dependencies and lockfile are pinned. Apache-2.0 licensed; prior MIT attribution is preserved in [NOTICE](NOTICE).

## Current milestone: isolated approved-redacted cloud handoff

Dual raw/broker builds, strict origin+window+nonce+requestId+revision messaging, App Check Enterprise before AI Logic, ONLY_IN_CLOUD structured adapter, and SDK HTTP-body capture are implemented. **Production source remains locked** for parent review/deployment/testing. Raw connect-src remains data:; only the exact broker may be framed. [Integration](docs/CLOUD_HANDOFF.md).

- **86 tests**, typecheck and dual static build. Mocks explicitly labelled.
- [Two-origin browser evidence](docs/evidence/cloud-handoff-mocked-browser.json): real Chromium and pinned Firebase SDK serialization with **mock App Check/provider**. Approval, explicit send, redacted-only body, UTF-8/SHA parity against mocked network, local restoration, inert HTML output, stale cancellation and absent-attestation refusal pass. Not real inference/attestation or deployed DevTools proof.
- Parent [private SDK harness](docs/evidence/real-cloud-sdk-private-harness.json): **real cloud inference, not deployed app E2E**, gemini-3.5-flash-lite, in_cloud, 5589 ms sample. Unconstrained output was malformed and invented [NAME_2]; product now constrains responseSchema and rejects unknown placeholders. Semantic correctness is not guaranteed.
- [Valid-key/no-App-Check control](docs/evidence/appcheck-negative-control.json): **401 invalid App Check token**. The older no-client-key 403 in the SDK harness is NOT the correct App Check control.
- [Parent infrastructure snapshot](docs/evidence/cloud-infra-receipt.json): billing disabled/unlinked, telemetry NONE, enforced App Check, Enterprise provider. Its successfulCloudInference=false predates the successful harness. [Fresh Nano check](docs/evidence/nano-capability-nov12.json): absent/unavailable, no inference/accuracy/latency result.

### Local reviewed synthetic journey

Choose **Try the synthetic review journey (no AI)**, inspect/edit redactions, check the review confirmation, approve the exact redacted application JSON, then generate a labelled local example. All five supplied fixtures have deterministic explanation/deadline/action/draft templates. Relative dates stay unresolved; a council “before” date is not presented as inclusive. Source or redaction edits invalidate approval and clear results. Draft editing and local download work without cloud. This demonstrates workflow, **not Nano detection or Gemini inference**.

- Earlier milestone: 44 tests. Current suite: 86 tests, including labelled mocks.
- `npm run build`: TypeScript + Vite production build.
- `node scripts/verify-reviewed-journey.mjs`: isolated Chromium, built files with unchanged Hosting headers at port 5192. Requires separately available Playwright and Chromium; used existing workspace Playwright, no paid services. Set `CHROMIUM_PATH` if needed.
- [Browser evidence](docs/evidence/reviewed-journey-browser.json): 390/768/1440px, mandatory approval, local restoration, source/redaction invalidation, five fixtures, keyboard approval and edited draft download. No page exceptions or external browser requests. Deliberate CSP egress probe is blocked; expected CSP console errors and a harmless missing favicon 404 are retained. This is local QA, not deployment or real-device inference proof.
- [GitHub license evidence](docs/evidence/github-license.json): GitHub repository API and license endpoint detect **Apache-2.0**, and an isolated public browser confirmed the rendered [Apache-2.0 license link](docs/evidence/github-about-license.json) ([capture](docs/evidence/github-about-license.png)), after pushing the standard LICENSE. Prior MIT permission notice remains in NOTICE.
- [Boundary design / remaining gates](docs/REVIEWED_JOURNEY.md). Cloud remains source-locked. Client mocks do not prove enforcement; parent negative-control evidence is separate.

## November 9 spike verdict: PARTIAL — real-device gate blocked

**Question:** Can Firebase AI Logic web `firebase/ai` perform image input plus JSON-schema-constrained PII extraction entirely on device?

- Official Firebase docs support JPEG/PNG input and `onDeviceParams.promptOptions.responseConstraint`. Installed and typechecked: Firebase **13.2.0**, `@firebase/ai` **3.0.0**. This SDK requires input Part discriminants (`type: 'text'` and `type: 'inlineData'`), which older examples omit.
- The adapter explicitly sets **ONLY_ON_DEVICE**, awaits `initializeDeviceModel()`, and never creates a cloud model. Download interruption / initialization failure blocks inference. No preference mode or fallback exists in app code.
- Real isolated Chromium 156 check on this VM: LanguageModel API present, multimodal availability **unavailable**. No Nano inference was performed; image + schema accuracy and latency are **NOT_RUN**, not zero and not a pass. User-agent and capability evidence: [browser.json](docs/evidence/browser.json). A headless check is not a supported-device performance result.
- Nine adversarial state-machine tests, a browser-only initialization guard test, and local regex evaluation pass. Desktop and 390px browser preview: no page errors, no horizontal overflow, no external requests observed. Screenshots contain synthetic data only.
- **Recommendation:** use the built-in five-letter runner on supported desktop Chrome before building cloud explanation. Do not infer successful on-device multimodal inference from typecheck or docs alone.

### Reproduce the supported-device Nano test

Use current desktop Chrome on a supported OS/hardware. Approximately 22 GB free disk, 16 GB RAM or more than 4 GB VRAM; consult Chrome's current requirements. Enable the multimodal Prompt API flag if required by your Chrome version. Deployment outside localhost may additionally require an origin trial; confirm current Chrome guidance.

1. Open the app and click **Check this device**. If unavailable, stop. Do not bypass detection or send raw letters elsewhere.
2. Expand **Run the Nano research test**, paste your **public Firebase web config JSON** (not a Gemini API key). The config is used in memory only.
3. Click **Initialize on-device model**. This is the explicit download/user-activation step. Wait until ready. It may take minutes.
4. Run all five in **text** mode, export results, then run in **image** mode and export results. Images are PNGs drawn locally from synthetic fixtures. Nothing is uploaded.
5. Preserve browser/OS/version and cold initialization time separately. Per-letter latency measures generate + JSON parse + local matching, excluding initialization. The current runner measures one sample per letter: not a performance distribution.
6. Image transcription mismatches are reported and scores withheld rather than compared at invalid offsets. This strict initial criterion is deliberately conservative and may need alignment-based evaluation later.

Production spike CSP is `connect-src data:`. It permits local data-URL decoding (used by the SDK image adapter) but prevents Firebase network traffic; on-device inference should not need a cloud endpoint. If the SDK needs a metadata endpoint, this must be investigated without weakening the raw-content boundary. This has not been live-proven on a supported device.

## Synthetic evaluation (5-letter spike)

Ground truth in [src/fixtures.ts](src/fixtures.ts). All names, addresses and identifiers are invented. Metrics are **character-level PII coverage**, micro-averaged; overlapping spans are merged. Dates that are deadlines, not personal dates, count as false positives. No Nano or combined result is substituted with regex or ground truth.

| Detector | PII recall | Precision | Latency | Status |
|---|---:|---:|---|---|
| Regex only | 55.31% (172/311) | 72.88% (172/236) | Not benchmarked | Measured, 5 letters |
| Nano only, text | NOT_RUN | NOT_RUN | NOT_RUN | Device unavailable |
| Nano only, PNG | NOT_RUN | NOT_RUN | NOT_RUN | Device unavailable |
| Combined Nano + regex | NOT_RUN | NOT_RUN | NOT_RUN | Device unavailable |

These figures expose why regex alone cannot authorize cloud sending: it misses names and street addresses. Five fixtures are not representative validation. The planned 30+ corpus and a span-level scoring view remain unfinished. **No perfect-recall, anonymity or legal-compliance claim.**

## Architecture and hybrid inference

```text
[Raw text / local image]
          | stays in browser tab
          v
[firebase/ai ONLY_ON_DEVICE + JSON schema]
          | validated exact substrings
          v
[UK regex union] --> [Mandatory user review + edits]
                              | version-bound approval
                              v
                    [Redacted text + placeholders]
                              | isolated approved-redacted broker / ONLY_IN_CLOUD
                              v
                    [Explanation / dates / draft]
                              | un-restored cloud response
                              v
                    [Local placeholder restore]
```

**Implemented:** pure state machine, generation-bound approval, stale-response rejection, download/detection errors fail closed, UK regex union, strict matching/overlap merging, reserved-placeholder collision rejection, unknown-placeholder rejection, single-pass local restore, synthetic selection, regex preview, device check, Nano image/text runner, basic Nano review/add/remove/approve UI. Storage is in-memory for this spike.

**Implemented but source-locked:** isolated handoff, Enterprise App Check preflight, structured ONLY_IN_CLOUD generation and SDK HTTP-body ledger. Separate explicit synthetic-fixture cloud action says annotations, NOT Nano; local templates are never labelled AI. Ledger counts attempts and captured bodies separately. No capture after failed/cancelled handoff does not establish zero network. **Not proven/implemented:** deployed cloud app E2E/DevTools parity, real Nano, IndexedDB history, reminders, 30+ corpus.

The gate's injected transport receives only the immutable redacted JSON string captured at approval, never the original source, image, mapping, or instance. Tests cover empty/unavailable/unreviewed states, detector failure, stale detection, changed review, duplicate sends, stale responses, failed transport and placeholder collisions. This is a boundary invariant, **not a proof that every personal detail was found**. A missed PII span could survive redaction; human review and evaluation reduce, but cannot eliminate, that risk. Requiring Nano does not mean Nano is perfectly accurate.

### Exact ledger gate

Application payload and SDK body are distinct. Isolated broker temporarily hooks only the exact AI Logic generateContent POST BODY, validates SDK shape/exact approved payload before dispatch, and records body string, UTF-8 bytes, SHA-256, time and requested model. Tokens/headers/unrelated requests are never inspected/copied. Raw origin revalidates body/payload/bytes/hash on a correlated reply. Cancel/timeout may lose a report after dispatch. These are not compression/TLS bytes or remote-processing proof. **Independent deployed DevTools parity remains unproven.** [Details](docs/CLOUD_HANDOFF.md).

## Feature-ordered plan

1. **Privacy boundary:** extend SDK/browser contract tests; prove Nano image + schema on supported hardware; no raw fallback under any availability/download/error path.
2. **Redaction/review:** UK patterns and edge cases, accessible span editing, explicit immutable-payload approval and input/revision invalidation. Never authorize from regex-only preview.
3. **Cloud journey:** ONLY_IN_CLOUD, redacted text only, plain English, dates/actions/draft, prompt-injection controls and robust local restoration. Ship core journey before visual polish.
4. **Wire-exact privacy ledger:** actual request bytes, time, model and on-device data; camera-ready Network comparison.
5. **Product:** IndexedDB-only history, deadline list, copy/export, device onboarding and calm accessible design. No server-side letter storage.
6. **Evidence:** 30+ synthetic letters, Nano/regex/combined recall + precision, measured latency, honest failure cases in README.
7. **Optional:** on-device vs cloud latency/cost chip after core acceptance.

## Zero-spend / deployment controls

Parent provisioned Firebase project `safe-to-send-2026` on Spark, billing disabled. Static Firebase Hosting only. Deployment is parent-owned and requires release review; this milestone does not deploy or change resources. No Functions, Storage, domain/DNS, paid APIs, Live API or grounding. No billing upgrade/card.

Cloud model candidate is **gemini-3.5-flash-lite**, matching current Firebase hybrid docs. Free-tier availability and project enablement must be independently verified before any cloud call. Gemini Developer API only, never a paid backend. Set up reCAPTCHA Enterprise App Check within free quota and **enforce** it for AI Logic before enabling cloud. No debug token in production. Source lock prevents initialization. After reviewed source release, only the broker initializes Enterprise App Check before AI Logic.

No analytics, third-party fonts, external assets, error reporting or raw-content logging. Browser-local export is synthetic research JSON only. HTTPS Hosting has CSP, no-referrer, nosniff and disabled camera/microphone/geolocation. Raw connect-src stays data:; frame-src adds only broker. Broker alone has narrow AI Logic/App Check/recaptcha endpoints, requiring parent real-attestation testing.

## Sources

- [Firebase hybrid web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Structured output](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)
- [Chrome built-in AI requirements](https://developer.chrome.com/docs/ai/get-started)
- [Firebase App Check](https://firebase.google.com/docs/ai-logic/app-check)
- [Hackathon](https://firebasehybridaihackathon.devpost.com/)

Hackathon deadline supplied by owner: 30 November 2026, 22:00 UK. Owner handles submission and public promotion. No submission, contact or social posting is automated.

### SDK runtime caveat discovered by the spike

A mocked-fetch Node import of the current Firebase SDK attempted a cloud request despite ONLY_ON_DEVICE: its Node build has no Chrome adapter. No real network was used (fetch was a spy, synthetic sentinel only). Therefore this app explicitly refuses SDK creation outside a browser with LanguageModel, and the static Vite browser build is the only supported runtime. Do not move redaction into SSR, Node, a worker without audited API support, or a backend. This is an important reason to test the actual runtime rather than trusting the mode name alone. Actual isolated Chromium tests now prove both unavailable-model initialization and a removed-LanguageModel case reject with zero fetch attempts; see docs/evidence/sdk-browser-rejection.json. Successful/download-in-progress inference remains unproven.

## Built during submission period

Owner-provided rule changes (12 November): submission began **2026-11-11T21:30:00Z**, deadline **2026-11-30T22:00:00Z**. Existing work must be significantly updated and disclosed. This is owner-provided guidance, not independent eligibility clearance: the official rules fetch returned HTTP 403, and its challenge was not bypassed.

### Pre-existing preparatory spike — unchanged history

All five original commits are dated **9 November 2026**, before the submission start:

- 20ab95e (22:11:54Z): fail-closed privacy state machine and adversarial tests.
- 052a9b0 (22:13:15Z): on-device image/schema adapter, five synthetic fixtures, evaluation UI.
- aefd5f4 (22:16:53Z): browser-only guards and blocked-device documentation.
- 8d5b919 (22:17:05Z): absent/malformed LanguageModel guard tests.
- 9b1ffd3 (22:19:14Z): free Hosting verification and independent SDK audit evidence.

The original scope included regex preview, basic Nano review/add/remove/approve, and an injected test transport. It had **no explanation/deadlines/actions/draft journey or cloud inference**. Nano was unavailable on this VM. No commits or dates were rewritten. The linked live site and older screenshots document that spike, not this new milestone.

### Post-start implementation (12 November 2026)

The earlier post-start milestone added mandatory checked review of an immutable redacted payload, structured explanation/deadline/action/draft parsing and local restoration, revision-bound result invalidation, a clearly labelled synthetic journey, a disabled cloud SDK adapter with App Check preflight, and additional tests plus browser negative-egress evidence. These are new implementation features, not successful Nano or cloud inference results. License metadata is now Apache-2.0, retaining the original MIT notice.

The browser SDK also has the missing-adapter edge if LanguageModel is absent, not just Node. Explicit secure-browser + API method guards and network-blocking CSP are required. Result inferenceSource is asserted ON_DEVICE, but this post-response assertion is detection, not upload prevention.

### Subsequent post-start handoff implementation (12 November)

New substantial changes: dual-origin isolation, single-use revision/nonce/request protocol, immutable approved-byte send, cancellation, Enterprise broker setup, schema-constrained SDK generation, HTTP-body validation/capture, SHA ledger, 42 additional tests and mocked two-origin browser QA. This is implementation, not Nano/deployed app inference proof. Original dates, Apache-2.0 LICENSE and prior MIT NOTICE remain unchanged. Parent real SDK harness/control evidence is disclosed separately above.
