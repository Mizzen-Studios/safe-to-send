# Latest: isolated handoff milestone

The baseline report below is historical. Its 44-test count and not-implemented handoff/ledger statements describe earlier November 12 source, NOT current source.

Current implementation/review/build steps: [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md). Current suite: 85 tests, dual static builds and mocked two-origin real-browser/real-SDK QA. Release stays false pending parent review, real Enterprise browser attestation and deployed app/DevTools parity. Parent private SDK harness achieved real cloud inference; separate valid-key/no-token control returned 401. See README for evidence boundaries. Nano is unavailable/unproven. No raw-origin Google connect permission was added.

# Historical baseline report (before isolated handoff)

# Reviewed-letter journey — November 12 milestone

## Implemented scope

- Mandatory checked confirmation + explicit approval, bound to the current review revision and immutable application JSON.
- Review spans can be added/removed. Editing source requires detection again; editing redactions requires approval again, including after a completed result. Source/redaction edits clear displayed results.
- Structured explanation, deadline evidence/date/action, next actions, editable draft, local text download. Parsing rejects unexpected keys, malformed dates, empty/oversized fields and missing deadline quotes. Relative dates may remain null; quoted evidence must occur in the approved redacted letter. This is validation, not proof of correct legal interpretation.
- Single-pass local restoration across all response strings; JSON is parsed before restoring, so quotes/newlines/backslashes in local values cannot break the response shape. Unknown or malformed placeholder-like output fails closed. Mapping never enters the transport.
- Five deterministic synthetic fixture templates, explicitly labelled no AI/no network. Fixture annotations are not Nano findings and do not establish recall. Editing a source resets to the selected supplied fixture when the synthetic walkthrough is chosen again.
- Existing app runtime imports firebase/ai and calls initializeDeviceModel/generateContent through the Nano controls. This remains ONLY_ON_DEVICE, browser/API guarded, with no cloud fallback. The SDK contract tests mock these methods and are not successful runtime inference evidence.
- Prepared cloud.ts adapter uses ONLY_IN_CLOUD, candidate gemini-3.5-flash-lite, and App Check token preflight before model creation/generation. It is hard-locked at the first instruction before any token/SDK/network operation. Production bundling can tree-shake unreachable adapter code; source presence is not cloud runtime proof. No environment, URL or browser-storage switch can unlock it.

## Network boundary — do not loosen raw-origin CSP

The raw-letter page currently retains connect-src data: in firebase.json. No CSP/config/resource changes were made. Browser QA serves built assets with exactly those headers; Vite development mode is not the audited production security boundary.

A future reviewed design should move cloud inference and App Check to a distinct origin which never receives raw text, images, mapping, or restored replies. A tightly validated origin/nonce/revision-bound message may hand over only the immutable approved redacted application payload. The raw page must retain its no-cloud connect-src. Any frame-src allowance, sandbox configuration, message protocol, third-party App Check scripts and isolated-origin CSP need parent review and independent negative tests before implementation/release. No separate origin or handoff is provisioned or implemented here. Do not simply change CLOUD_RELEASE_ENABLED or open Google endpoints on the raw page.

App Check preflight tests cover absent/wrong-app instances, empty attestation, token failure, successful mocked preflight, and a release lock that precedes all of them. These do not prove reCAPTCHA operation, real attestation, server-side AI Logic enforcement, free-tier availability, or that a cloud network boundary is safe. Those remain release gates.

## Evidence and verification

- npm test: 44 tests; npm run build: typecheck + static build, Node 24.22.1.
- scripts/verify-reviewed-journey.mjs: isolated Playwright Chromium 145 against local production build with unchanged Firebase headers. Checks mandatory approval, redacted payload, placeholder restoration, date presentation, source/redaction revision invalidation, 390/768/1440px overflow, all five fixture templates, keyboard Space/Enter approval, edited draft download, missing-LanguageModel refusal before fetch, and deliberately blocked synthetic egress probe.
- docs/evidence/reviewed-journey-browser.json and reviewed-journey-{390,768,1440}.png record local synthetic QA. No real letter or credential is used. Expected CSP console messages and missing favicon 404 are retained, not hidden. Initial Snap Chromium 156 download readback failed because its private temporary filesystem is not visible to host Node, and its confinement rejected the hidden-workspace download path. The final full run uses the installed non-Snap Playwright Chromium 145 with a shared ignored workspace downloadsPath; the initial failure is preserved separately. This is not a complete accessibility audit, mobile hardware check, successful Nano result or deployment check.
- docs/evidence/github-license.json records GitHub About license metadata detection: Apache-2.0. An isolated public browser also verified the rendered Apache-2.0 license link (github-about-license.json/png). Standard LICENSE and package metadata agree; NOTICE preserves the original MIT copyright/permission text.

## Honest runtime gaps / release blockers

Nano is unavailable on this VM. Supported-device text/image/schema inference and measured model accuracy/latency remain NOT_RUN. Cloud inference is NOT_RUN. No model or App Check resources were configured; no key/debug token was committed or logged. Gemini free-tier availability and Spark compatibility must be verified before any cloud attempt. No billing/card, paid API, Functions or Storage change occurred.

The gate ledger records the application payload, not Firebase's serialized HTTP body. Synthetic template entries are local injected-transport events, never cloud requests. No SDK HTTP body exists to capture here. Wire-exact logging must be implemented at the future isolated SDK boundary and compared to DevTools before making that claim. Model-reported identity, attestation metadata, and SDK metadata requests must be distinguished from the requested model and application JSON.

History remains dated: original November 9 spike 20ab95e through 9b1ffd3; new work is after owner-provided start 2026-11-11T21:30:00Z. Owner-provided deadline is 2026-11-30T22:00:00Z. Rules HTTP 403 was not bypassed and eligibility is not independently cleared. No deployment, cloud account/resource mutation, workspace memory or registry edits were performed.
