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
