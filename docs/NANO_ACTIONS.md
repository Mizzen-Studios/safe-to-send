# Nano probe on standard free public Actions runners

Manual workflow: **Nano on free public runners** (.github/workflows/nano-probe.yml).
Parent must integrate/register this file on the default branch, then dispatch it immediately. This lane does not merge, deploy or dispatch. The workflow runs only ordinary x64 ubuntu-latest and windows-latest, max parallel 2, timeout 25 minutes each, read-only repository permissions and no secrets. Standard runners for public repositories are free; do not change labels to larger, GPU or paid machines.

## Method

1. npm ci uses the existing lock unchanged. An isolated, pinned Playwright driver is installed under the ignored scripts/nano-ci/.driver directory, not package.json.
2. Playwright installs genuine **Google Chrome Stable**, not bundled Chromium. Linux is headed under Xvfb; Windows attempts headed Chrome. No GPU/CPU/RAM eligibility spoofing, no model substitution, no bypass-of-performance flags. The multimodal feature flags are logged; this is a flagged diagnostic, not proof of unflagged production support.
3. Inventory records OS, architecture, CPU count, RAM, GPU description and actual free disk. No preinstalled tools are deleted. A shortfall is evidence, not an excuse to modify this host or purchase capacity.
4. A fresh isolated browser profile visits a loopback-only Vite-built page. Playwright clicks visible buttons. Direct LanguageModel.create declares expected text/image input and text output, attaches downloadprogress monitoring, and sends a generated synthetic code image with responseConstraint JSON Schema. A second button executes the installed firebase/ai ONLY_ON_DEVICE initializeDeviceModel / generateContent path using the same image/schema.
5. Firebase 13.2 requires nonempty apiKey/projectId/appId strings even in ONLY_ON_DEVICE. Explicitly invalid local placeholders satisfy local presence checks; they are not real keys, project registration or credentials. No cloud parameters or App Check are used. Missing LanguageModel refuses SDK initialization. CSP connect-src data: plus page request interception deny cloud HTTP fallback. Browser-managed model component downloads may use the network; inference inputs must not.
6. Exact JSON with the image code BLUE-472 is required, and SDK inferenceSource must be ON_DEVICE. Only both actual results permit REAL_ON_DEVICE_IMAGE_SCHEMA_PASS. Availability, mocked tests, a model download, a visible API, or successful bundle build are **not inference proof**. Non-success exits 1 with honest classification.

## Evidence and limitations

Artifacts (7 day retention): hardware.json, result.json (Chrome version, flags, availability, progress, outputs, errors, blocked origins), screen.png, and Playwright viewport screen video (webm). No HAR, tracing, network credentials, tokens or browser profile are uploaded. Periodic screenshots/results preserve partial evidence; final context close flushes video even for normal failure. A browser launch failure cannot yield a browser screenshot/video; hardware and result remain. A hard runner kill can interrupt flushing/upload.

Each direct download/inference attempt is capped at 9 minutes and SDK at 4 minutes, leaving installation and artifact time within 25 minutes. A direct timeout stops subsequent inference to avoid overlapping model operations; SDK is then NOT_RUN. Model installation is deliberately cold on each ephemeral runner.

Public x64 runners commonly advertise four CPUs and 16 GB RAM, but Chrome eligibility also depends on available profile disk (often at least 22 GB), usable GPU/CPU configuration, Chrome/model support, policy and model distribution. Windows/Linux virtual machines and Xvfb do not guarantee support. Record actual availability and failure rather than inventing the rejection reason. This is a feasibility probe, not the 30+ letter recall/precision corpus, sandbox attestation, product UI demo or physical-device certification.

## Local checks (not Nano evidence)

Run from the repository root:

    node --check scripts/nano-ci/page.js
    node --check scripts/nano-ci/probe.mjs
    node --check scripts/nano-ci/hardware.mjs
    node scripts/nano-ci/build.mjs

A local ARM64 host cannot validate official x64 Chrome Stable runner eligibility. The Actions run remains NOT_RUN until its run URL and downloaded artifacts are reviewed.

## First dispatch: 43308803064 (12 November 2026)

Run: https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43308803064

Linux failed **before browser launch**: Chrome Stable 157.0.8103.78 installed successfully, but Playwright 1.58.2 rejected its recording-codec install with `ERROR: Playwright does not support ffmpeg on ubuntu26.04-x64`. This is a probe tooling defect, **not a Nano eligibility rejection**. Inventory: x64 Ubuntu26 image 20261111.196.1, four Xeon Platinum 8573C logical CPUs, total RAM 16,758,398,976 bytes, free profile-volume disk 93,145,341,952 bytes, no GPU line from lspci. No image/schema inference ran on Linux; no browser screenshot/video could exist.

Fix: pin isolated driver to Playwright 1.65.0, whose platform and ffmpeg download tables explicitly include ubuntu26.04-x64. No runner label/cost change or platform override.

The original dispatch flags were `--enable-features=PromptAPIForGeminiNano,PromptAPIForGeminiNanoMultimodalInput` and `--prompt-api-for-gemini-nano-multimodal-input`; preserve them when interpreting its evidence. They were not validated feature names. Chrome 157 source instead maps chrome://flags `prompt-api` and `prompt-api-multimodal-input` to `blink::features::kAIPromptAPI` and `blink::features::kAIPromptAPIMultimodalInput` via FEATURE_WITH_PARAMS_VALUE_TYPE / FEATURE_VALUE_TYPE (base FeatureList, not a raw switch named after the flag). The corrected explicit equivalent is `--enable-features=AIPromptAPI,AIPromptAPIMultimodalInput`. runtime_enabled_features.json5 also lists both exact names as stable on desktop; this is not a hardware bypass or a model replacement.

Version-specific evidence:
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/chrome/browser/about_flags.cc
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/third_party/blink/renderer/platform/runtime_enabled_features.json5

The fix is pending parent review/integration and a separate dispatch. These changes alone do not establish any successful Nano execution.

### Windows final first-run outcome

Windows launched genuine headed Chrome 157.0.8103.79 but the local page failed navigation with ERR_HTTP_RESPONSE_CODE_FAILURE. Root cause: probe path guard used a POSIX slash suffix against Windows backslash paths, returning 404 for valid files. Consequently availability/create/prompt and SDK inference were NOT_RUN. The process printed its failure within seconds but SDK/browser handles kept it alive until the 25-minute job cancellation. Only hardware.json and result.json were uploaded; screenshot/video did not survive this failure. No precise Nano eligibility rejection is available because the test page never loaded.

Windows inventory: 4 AMD EPYC logical CPUs, 17,174,360,064 bytes RAM, 235,732,299,776 free disk bytes, Microsoft Hyper-V Video with no reported AdapterRAM, Windows build 10.0.26100. Neither runner had a disk shortfall, so deleting toolchains is unnecessary for this retry. Fix uses node:path.relative confinement on either platform and explicit process exit only after final artifacts/context closure. POSIX and Windows path tests pass locally; actual retry remains parent-owned.

## Corrected run: 12 November 2026

[Run 43313425316](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43313425316), source b2675db, reached actual headed Chrome 157 on both standard runners. Both reported text/image availability unavailable. Direct image/schema creation failed with NotSupportedError: service is not running; Firebase ONLY_ON_DEVICE returned AI/api-not-enabled. No download events or model output occurred. Setup fixes worked; this is now a real API/service rejection, not proof of the underlying cause. Linux had 93 GB free and Windows 235 GB; no cleanup was needed.

[Reviewed hardware and result summary](evidence/nano-free-runner-result.json). Screenshots/videos remain in the run artifacts (7-day retention) and the ignored local artifact directory. These are failure-diagnostic recordings, not successful Nano demo footage. Accuracy, latency and two-key model catch rate remain unmeasured. A focused eligibility/service diagnostic is next; no paid machine or eligibility spoofing is authorized.

## Focused service/eligibility diagnostic (prepared, not dispatched)

Source inspection on 12 November identified a concrete **probe interference risk**: pinned Playwright 1.65.0 launches Chrome with both `--disable-component-update` and `--disable-background-networking` by default. Previous result.json recorded only our two feature flags, not the full effective command line. This can suppress browser-managed component delivery; it is **not yet proven to be the cause** of run 43313425316. The next probe omits only those two defaults, records the effective command line, and requires Chromium sandboxing (no no-sandbox fallback). This restores normal browser component delivery, not hardware eligibility.

No extra CPU/backend override is justified: Chrome 157 source enables OnDeviceModelCpuBackend and CPU image input by default. IsCpuCapable requires a 64-bit build, >=15000 MiB physical RAM and >=4 processors (field-trial parameters can differ). Both reported inventories exceed those source defaults: Linux 15983.047 MiB and Windows 16378.746 MiB, four logical processors. GPU absence alone therefore does not prove ineligibility. Official documentation requires >=16 GB RAM and >=4 cores for CPU, >=22 GB profile-volume space, supported desktop OS, and an unmetered connection. Audio requires GPU; this probe does not use audio. No inspected official source/document declares all VMs unsupported. CPU inventory does not prove network, policy, component distribution or effective feature eligibility.

### Exact next action (parent review/integration/dispatch only)

Review this branch's diff, integrate its commit, then manually dispatch the existing nano-probe.yml once against the integrated ref. No workflow resource/runner/timeout changes are needed: same ordinary ubuntu-latest/windows-latest, maximum 25 minutes each. **This child has not dispatched or pushed.**

The probe now:
- Captures sanitized read-only chrome://on-device-internals (Broker State plus shadow-DOM Event Logs), chrome://policy, chrome://gpu and chrome://components before/after registration and after each completed stage. It never changes policy, presses Tools controls, resets crashes, forces assets or overrides eligibility. Raw diagnostic-page videos are deleted; only the synthetic inference page is retained as video.
- Samples genuine text/image availability every 15 seconds for at most three minutes, stopping early when text becomes downloadable/downloading/available. This is a bounded observation window, not a guarantee: component updater source has a normal one-minute initial delay; performance metric evaluation can be scheduled at three minutes, and distribution may take longer.
- Clicks a separate **text-only** create + prompt (six-minute cap), then direct image/schema (three minutes), then SDK ONLY_ON_DEVICE image/schema (three minutes). A timeout stops subsequent operations rather than overlapping them. A text PASS means actual text create/prompt resolved, not image/schema support or accuracy. Existing image/schema success classification still requires both actual direct and SDK validated fixture results.
- Keeps page HTTP egress blocked and no real Firebase credentials. Browser-managed model delivery may use normal network. No HAR, tracing, profile, tokens, netlog or raw stderr upload. Sanitizes URL paths/query, local paths, emails and credential-shaped fields. Hardware evidence remains unchanged. WebUI content is from a fresh unsigned-in profile; these scrubbers are not a guarantee for arbitrary user profiles.

Review result.json effectiveArgs first (component suppression/no-sandbox must be absent), then diagnostics-initial.json vs diagnostics-after-registration-wait.json, exact Broker use-case Unavailable Reason / manifest criteria / asset error, existing policies, GPU feature status, registrationSamples, text stage and download progress. SDK api-not-enabled is a wrapper symptom, not an independent root cause. If service remains unavailable, report the exact captured Broker requirement/error; do not retry unchanged or claim virtualisation alone caused it. If diagnostics are missing, report that capture failure rather than infer a reason.

### Official/source references

- https://developer.chrome.com/docs/ai/get-started (CPU requirements, download, Broker State troubleshooting)
- https://developer.chrome.com/docs/ai/prompt-api (current API use; no additional CPU fallback flag required)
- https://developer.chrome.com/docs/ai/debug-built-in-model (Event Logs)
- https://github.com/microsoft/playwright/blob/v1.65.0/packages/playwright-core/src/server/chromium/chromiumSwitches.ts (exact defaults)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/services/on_device_model/public/cpp/cpu.cc (physical RAM, processors, 64-bit eligibility)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/services/on_device_model/public/cpp/features.cc (CPU backend enabled by default)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/components/optimization_guide/core/model_execution/performance_class.cc (CPU fallback/image support; scheduled evaluation)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/components/component_updater/configurator_impl.cc (normal initial delay)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/components/optimization_guide/core/model_execution/on_device.md (broker -> asset-provider registration -> component update -> service lifecycle)

Local validation: node --check on all changed JS, node --test scripts/nano-ci/check-diagnostics.mjs (sanitization/read-only capture tests), probe bundle and full npm run build. These are tooling checks, not Nano execution evidence; local ARM64 cannot reproduce the genuine x64 Stable runner service. New runner outcome remains NOT_RUN until parent dispatch and evidence review.

### Sandboxed service observation

[Run 43315346553](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43315346553), b7f459d, successfully launched sandboxed headed Chrome on both standard runners, without component-update/background-network suppression. Thirteen samples over 180 seconds remained unavailable for text/image. Genuine text-only and image/schema creation failed with service not running; device-only Firebase returned api-not-enabled. No download or inference output occurred. The model manifest component is not proof of downloaded weights. Software GPU observations do not establish causation.

[Sanitized per-platform receipt](evidence/nano-sandboxed-service-result.json). Broker State/Event Logs were inaccessible because Chrome disables internal debug pages by default; the exact rejection reason remains unknown. A focused repair will enable diagnostic pages in the isolated profile and verify that actual broker content was captured before another run. No eligibility override or paid resource is authorized.

## Debug-page capture repair after run 43315346553

That run completed actual sandboxed headed Chrome 157 on both OSes, but its
on-device-internals artifact was only Chrome's **internal debugging pages disabled**
message. It did not inspect the broker. This repair changes only visibility in the
fresh isolated probe profile: visit chrome://chrome-urls/, click exactly
**Enable internal debugging pages**, and wait for **Disable internal debugging
pages**. If already enabled, do not click/toggle it off. No launch/default flags,
field trials, optimization settings, eligibility, policy, model tools, use-case
checkboxes, downloads or resets are changed.

The existing diagnostics-<stage>.json files now store independent captures:
- brokerState.text: populated Broker Properties plus Manifest Criteria,
  Assets / Error and Use Cases / Unavailable Reason.
- eventLogs.text and eventLogs.rowCount: Event Logs table including Source
  Location and Log Message. Zero rows means the live table was empty, not a logged
  rejection. These two captures cannot overwrite one another.

Each panel has status CAPTURED and inspected=true only after its visible live
content is asserted. Broker capture also requires a populated property cell,
not merely static headings. A missing/disabled page, missing tab, unpopulated
broker shell or missing content marker records PAGE_UNAVAILABLE with a sanitized
error and inspected=false. Top-level brokerInspected refers only to Broker State;
top-level status requires both panels. If enabling fails, neither panel is marked
inspected. Inspect the exact broker requirement/error and event messages before
attributing the unavailable service to any cause. A capture failure is not an
eligibility result. Diagnostic tabs (including chrome-urls) are closed and their
raw videos deleted as before.

Selectors checked against Chrome 157.0.8103.78 source:
- components/webui/chrome_urls/resources/app.html.ts and app.ts (exact enable/disable labels).
- chrome/browser/resources/on_device_internals/app.html.ts, broker_state.html.ts
  and event_log.html.ts (panel elements, property cells, event headers).

Local tooling exercise: actual headed ARM64 Chromium 156.0.8078.79 under Xvfb,
fresh isolated profile, confirmed enabled/clicked=true then already-enabled/
clicked=false, real Event Logs capture with zero rows. This local build exposed
an unpopulated Broker State shell: the new assertion correctly reported
PAGE_UNAVAILABLE / brokerInspected=false rather than claiming inspection.
Local browser required no-sandbox (not a change to the runner probe); therefore
this is **selector/toggle testing only, not Nano, sandbox, runner eligibility or
inference proof**. Genuine Chrome 157 runner broker rejection remains unobserved
until parent integrates and separately authorizes a run. This child did not push,
dispatch or modify main.

Focused regression command: node --test scripts/nano-ci/check-diagnostics.mjs
(7 tests covering sanitization, separate captures, allowlisted clicks, idempotent
 enable, blocked-page metadata, empty broker shell, incomplete event content and
 command inspection fallback).

## Final inspected free-runner outcome

Run 43317358518 enabled debug pages successfully, but Broker State stayed unpopulated and Event Logs contained zero rows on both OS. Genuine sandboxed headed text/image create still failed with service not running; no download/inference occurred. Exact rejection reason remains unknown. [Final sanitized receipt](evidence/nano-final-free-runner-result.json). Unchanged retries are stopped; request an existing authorized remote desktop rather than claiming general VM incompatibility or buying capacity. See [machine requirements and operator-owned recording plan](DEVICE_TESTING_AND_RECORDING.md).
