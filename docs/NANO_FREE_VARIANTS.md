# Additional free-runner variants (review before dispatch)

Prepared on 2026-11-13 from main 259e3206b809e6ea8291ff3dbe89434d5669b70e. No push or dispatch performed by the implementation worker.

## Bounded plan

Six standard public x64 jobs only: Ubuntu Stable/Dev; Windows Stable/Dev/Canary; Windows Stable requested-perf-bypass diagnostic. Maximum two concurrent, 25 minutes/job, no retries or larger runners. Existing 3-minute registration window and bounded text/image/SDK stages remain. All run genuine installed Google Chrome, not Chrome for Testing. Installers come directly from dl.google.com; Windows verifies a valid Google Authenticode signature before execution. A missing executable, distribution failure or unsupported flag is a blocker, not a model result. Linux Dev is google-chrome-unstable; Canary is intentionally Windows-only.

Chrome starts as an ordinary native process and Playwright attaches over loopback CDP. This removes **all** Playwright launch suppressions (including component/background-network and disable-features defaults), rather than guessing a growing ignore list. Sandbox is not disabled. Effective command line is inspected via chrome://version when the automation-only CDP method refuses. Each variant has an isolated workspace profile under scripts/nano-ci/profiles, never a temporary profile/cache restore or another user's profile. Profiles are persistent for that job, not uploaded or retained between ephemeral runners. A strict 22 GiB free-profile-volume gate stops before browser launch. No automatic disk cleanup.

## Flags: verified names versus requested hypothesis

Native rows retain source-verified Chrome 157 flags --enable-features=AIPromptAPI,AIPromptAPIMultimodalInput. Existing pinned Chrome 157 source review and prior receipts remain in NANO_ACTIONS.md. Feature names can change in Dev/Canary; passing a string does not prove it is recognized.

The separate requested-perf-bypass row adds exactly OptimizationGuideOnDeviceModel:BypassPerfRequirement/true,PromptAPIForGeminiNano to that enable-features argument. These requested names/parameter are **UNVERIFIED for the installed channels and may be ignored**; this work did not establish a currently supported implementation. Do not describe them as a working hardware bypass. A successful diagnostic would still NOT attest ordinary hardware eligibility, normal consumer availability or Enterprise App Check. No result from that row may replace the native-row evidence.

## Evidence and privacy

Existing hardware, GPU, effective flags, text versus image availability, real user-click download/create, direct image+schema and Firebase ONLY_ON_DEVICE stages remain separate. CSP connect-src data: and page request routing remain unchanged; browser-managed component/model downloads are not page cloud inference. Raw-cloud, App Check, products, resources, credentials and Hosting are untouched.

Broker properties require actual populated property cells and expected content markers; an empty shell stays PAGE_UNAVAILABLE. Events require their actual column markers, and zero rows remain zero rows. Partial broker/events screenshots are named unavailable rather than reclassified as a readable rejection. Components require content/version markers. Diagnostic screenshots redact URL/path/email/credential-shaped text in the isolated WebUI immediately before capture; JSON is captured/sanitized first, preserving readable rejection wording except those redactions. Inspect artifacts visually before sharing. Policy/GPU are JSON-only. CDP attach does not record video: result explicitly says NOT_RECORDED_CDP_ATTACH; existing defensive diagnostic video deletion remains. This is not demo footage.

No new browser execution/inference evidence was created locally: this implementation host is ARM64 and is deliberately rejected by the x64 launcher guard. The exact prior service rejection cause remains UNKNOWN until actual populated internals evidence says otherwise.

## Sources checked

- https://dl.google.com/linux/chrome/deb/dists/stable/main/binary-amd64/Packages (official Stable/unstable package distribution; Dev package observed 159.0.8144.0-1 during preparation)
- https://raw.githubusercontent.com/chromium/chromium/refs/tags/137.0.7151.55/chrome/install_static/google_chrome_install_modes.h (official Windows Stable, side-by-side Dev GUID 401C381F-E0DE-4B85-8BD8-3F3F14FBDA57, Canary GUID and install suffixes; Canary not system-level)
- https://raw.githubusercontent.com/microsoft/playwright/v1.56.1/packages/playwright-core/src/server/registry/index.ts (genuine channel executable paths; Dev/Canary paths do not imply Playwright supports installing those channels)
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/chrome/browser/about_flags.cc
- https://chromium.googlesource.com/chromium/src/+/refs/tags/157.0.8103.78/third_party/blink/renderer/platform/runtime_enabled_features.json5
- https://developer.chrome.com/docs/ai/get-started

## Local verification

165 application tests; 9 focused diagnostics/configuration tests; syntax checks for every nano-ci .mjs; TypeScript and both production builds; standalone SDK probe bundle; git diff --check. All passed. No actual Windows/Linux x64 launch or installer execution on this ARM64 host; parent owns review/integration and the single authorized dispatch.
