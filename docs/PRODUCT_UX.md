# Product experience

## Design plan
An open correspondence desk: pale blue paper (#f1f6fa), white letter (#ffffff), ink (#19384b), deep sea action (#125b68), selection gold (#ffe39b), quiet slate (#536977). Local Trebuchet/Segoe UI for approachable, readable instructions; no external fonts. A wide editable letter sits beside a narrow privacy rail, stacking in reading order on mobile. The distinctive element is the letter with highlighted redactions, not a grid of marketing cards. All alignment left; numbered steps represent the actual workflow.

Plan critique: avoid a generic SaaS dashboard. Keep only a small header and three views (Letter, Saved on device, Evidence). Make paste/select/drop and review the home screen. Move evaluation/config/raw evidence out of the primary task.

Manual mode is a supported no-Nano path, not proof of model detection. Regex suggestions can miss names/addresses and catch useful dates. Every cloud input must be explicitly declared synthetic, have at least one actual redaction, be reviewed, then approved at its current revision. Arbitrary reviewed synthetic text is allowed; fixture identity is not an authorization boundary. Never fall back to raw source.

History is opt-in IndexedDB in this browser only, with explicit save, individual delete and clear. It includes the restored draft and explanation, never automatically saves the original or network ledger. Reminders are local date notes shown only when the app is open, not background/push notifications. Browser data can be cleared; shared devices are not private.

Nano status and advanced device configuration are separate from manual review. Real Nano execution remains unverified on this host. Existing isolated broker, App Check and source CSP remain unchanged.

## Integration hooks for parent / lane B
- Main consumes the parent-provided compile-time `__DEVICE_CONFIG__`, guarded with typeof for local builds. No paste-config field. Local missing config is friendly and manual review remains available.
- The earlier handoff below is superseded by the integrated hybrid controls section. The sample template remains deliberately labelled not inference and only supports supplied examples.
- Manual review uses existing `gate.detect(regexSpans)` to enter review; it does not call `deviceUnavailable`. Any reviewed synthetic input may be approved. Synthetic declaration and exact-payload checkbox are separate and must both be checked. Edits rebuild controls and invalidate revision approval.
- The two local browser scripts now use both required checkboxes. The cloud mock negative test removes all redactions to test whole-original refusal instead of the removed fixture-identity policy. Parent-owned deployed-proof script was not edited.

## Verification
Run `npm run build && npm test && node tests/product-ui.browser.mjs`. The browser script uses the existing workspace Playwright installation (no dependency addition), serves dist with the unchanged Hosting source CSP at registered localhost port 5192, and launches isolated headless Chromium with --no-sandbox for VM diagnostics only. This is not sandboxed production or real model/attestation proof.

2026-11-12: typecheck + dual builds + 90 existing unit tests passed. Product browser QA passed at 390 / 768 / 1440 widths: no initial horizontal overflow; keyboard two-checkbox approval; arbitrary synthetic manual review + add/remove; approval invalidation; zero-redaction refusal; actual browser IndexedDB save/reload/delete/clear/context isolation; saved markup escaped; local file input. Zero external requests and zero page errors. Nano and cloud inference were not run. No deployment performed. Reminders do not run in the background. Only text import is supported.

## Integrated hybrid controls (2026-11-12)
Manual review now calls startManualReview(gate), not the detector shim. Every review exposes Explain on this device: runLocalAnswer uses the prepared ONLY_ON_DEVICE adapter or null; no transport is passed, unavailable remains explicit and no fallback occurs. Local results retain their redacted known values and are labelled On this device, separately from the local example template and cloud output.

Every accepted cloud answer exposes Check claims on this device, calling runTwoKey with the unchanged accepted Journey and current gate. Per-claim action/deadline/amount outcomes are shown alongside their claim values. Mismatch, unknown and unsupported are not collapsed into success. Model-supported is explicitly not a truth guarantee; the editable draft is not checked. Unavailable verifier is explicit even when cloud succeeded. Source/redaction edits remove results; operation and revision guards discard stale local completions. Starting a cloud/sample result also invalidates a pending local display.

Run node tests/hybrid-ui.browser.mjs for deliberate build-time Nano/handoff mocks (never runtime production switches). This proves UI wiring only, not actual Nano inference, provider correctness or production attestation. It covers keyboard controls, mobile/tablet/desktop overflow, mismatch/unknown, model absence/failure, stale local answer/verifier responses, and context-wide zero fetch/external requests. Production source has no test adapter globals. Existing product browser QA separately exercises real IndexedDB and source CSP without model execution.

Integrated verification: 110 unit tests, typecheck and dual builds passed. Hybrid mock UI, product UI/IndexedDB, all-five-fixture local template journey and real-SDK/mock-provider isolated cloud handoff browser suites all passed. SDK mock body parity was 2065 bytes with SHA-256 e295212e41943c3d9dcf5972527d1b0f1edfd8e12d16687932174b858aa7426c. This is serialization evidence only, not actual cloud/Nano inference. Updated local screenshots and browser receipts are in docs/evidence. No deployment or real service call was made.
