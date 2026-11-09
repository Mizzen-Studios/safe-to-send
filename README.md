# Safe to Send

A private-first helper for stressful UK official letters. New work begun 9 November 2026 for #BuildHybridAI. **Week-one spike, not a finished product. Synthetic letters only.**

**Live cloud-disabled spike:** https://safe-to-send-2026.web.app

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

Open http://localhost:5192. `npm run build` typechecks and builds the static site; `npm run eval` reports the five-letter regex baseline. Dependencies and lockfile are pinned. MIT licensed.

## Spike verdict: PARTIAL — real-device gate blocked

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
                              | future ONLY_IN_CLOUD
                              v
                    [Explanation / dates / draft]
                              | future cloud response
                              v
                    [Local placeholder restore]
```

**Implemented:** pure state machine, generation-bound approval, stale-response rejection, download/detection errors fail closed, UK regex union, strict matching/overlap merging, reserved-placeholder collision rejection, unknown-placeholder rejection, single-pass local restore, synthetic selection, regex preview, device check, Nano image/text runner, basic Nano review/add/remove/approve UI. Storage is in-memory for this spike.

**Not implemented / not enabled:** cloud model or request, production App Check, byte-exact wire ledger, explanation/deadlines/draft, IndexedDB history, reminders, copy/export reply, 30+ corpus. No cloud request means the visible privacy ledger correctly says **0 cloud requests**. There is no fake cloud success.

The gate's injected transport receives only a freshly constructed redacted JSON string, never the original source, image, mapping, or instance. Tests cover empty/unavailable/unreviewed states, detector failure, stale detection, changed review, duplicate sends, stale responses, failed transport and placeholder collisions. This is a boundary invariant, **not a proof that every personal detail was found**. A missed PII span could survive redaction; human review and evaluation reduce, but cannot eliminate, that risk. Requiring Nano does not mean Nano is perfectly accurate.

### Exact ledger gate

The pure gate records the exact **application payload string** plus UTF-8 byte length, time, requested model, attempted/succeeded/failed state, and what remains local. Firebase serializes this again into its own HTTP request. These are not interchangeable. Before cloud release, the ledger must capture the actual serialized SDK HTTP body, byte-for-byte, and compare it with DevTools Network. Model-reported identity should be recorded separately from requested model if available. Do not advertise the current ledger as wire-exact.

## Feature-ordered plan

1. **Privacy boundary:** extend SDK/browser contract tests; prove Nano image + schema on supported hardware; no raw fallback under any availability/download/error path.
2. **Redaction/review:** UK patterns and edge cases, accessible span editing, explicit immutable-payload approval and input/revision invalidation. Never authorize from regex-only preview.
3. **Cloud journey:** ONLY_IN_CLOUD, redacted text only, plain English, dates/actions/draft, prompt-injection controls and robust local restoration. Ship core journey before visual polish.
4. **Wire-exact privacy ledger:** actual request bytes, time, model and on-device data; camera-ready Network comparison.
5. **Product:** IndexedDB-only history, deadline list, copy/export, device onboarding and calm accessible design. No server-side letter storage.
6. **Evidence:** 30+ synthetic letters, Nano/regex/combined recall + precision, measured latency, honest failure cases in README.
7. **Optional:** on-device vs cloud latency/cost chip after core acceptance.

## Zero-spend / deployment controls

Parent provisioned Firebase project `safe-to-send-2026` on Spark, billing disabled. Static Firebase Hosting only. Deploy with `npm run build && firebase deploy --only hosting --project safe-to-send-2026` after verification. No Functions, Storage, domain/DNS, paid APIs, Live API or grounding. No billing upgrade/card.

Cloud model candidate is **gemini-3.5-flash-lite**, matching current Firebase hybrid docs. Free-tier availability and project enablement must be independently verified before any cloud call. Gemini Developer API only, never a paid backend. Set up reCAPTCHA Enterprise App Check within free quota and **enforce** it for AI Logic before enabling cloud. No debug token in production. This research build deliberately initializes neither App Check nor cloud inference.

No analytics, third-party fonts, external assets, error reporting or raw-content logging. Browser-local export is synthetic research JSON only. HTTPS Hosting has CSP, no-referrer, nosniff and disabled camera/microphone/geolocation. CSP should be changed only with a reviewed endpoint allowlist once the cloud privacy gates pass.

## Sources

- [Firebase hybrid web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Structured output](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)
- [Chrome built-in AI requirements](https://developer.chrome.com/docs/ai/get-started)
- [Firebase App Check](https://firebase.google.com/docs/ai-logic/app-check)
- [Hackathon](https://firebasehybridaihackathon.devpost.com/)

Hackathon deadline supplied by owner: 30 November 2026, 22:00 UK. Owner handles submission and public promotion. No submission, contact or social posting is automated.

### SDK runtime caveat discovered by the spike

A mocked-fetch Node import of the current Firebase SDK attempted a cloud request despite ONLY_ON_DEVICE: its Node build has no Chrome adapter. No real network was used (fetch was a spy, synthetic sentinel only). Therefore this app explicitly refuses SDK creation outside a browser with LanguageModel, and the static Vite browser build is the only supported runtime. Do not move redaction into SSR, Node, a worker without audited API support, or a backend. This is an important reason to test the actual runtime rather than trusting the mode name alone. Actual isolated Chromium tests now prove both unavailable-model initialization and a removed-LanguageModel case reject with zero fetch attempts; see docs/evidence/sdk-browser-rejection.json. Successful/download-in-progress inference remains unproven.

### Contest eligibility is not cleared

Independent research on 9 November found the official Devpost rules page explicitly says rules are not yet available and the overview lists a November 11 start. This November 9 code is a dated preparatory spike, **not eligibility-cleared contest work**. Preserve it and its timestamps; recheck official rules before deciding whether contest implementation must begin afresh. Do not represent prize allocation, AI-tool permission, or pre-event work as verified until published rules are reviewed.

The browser SDK also has the missing-adapter edge if LanguageModel is absent, not just Node. Explicit secure-browser + API method guards and network-blocking CSP are required. Result inferenceSource is asserted ON_DEVICE, but this post-response assertion is detection, not upload prevention.
