# Product experience

## Design plan
An open correspondence desk: pale blue paper (#f1f6fa), white letter (#ffffff), ink (#19384b), deep sea action (#125b68), selection gold (#ffe39b), quiet slate (#536977). Local Trebuchet/Segoe UI for approachable, readable instructions; no external fonts. A wide editable letter sits beside a narrow privacy rail, stacking in reading order on mobile. The distinctive element is the letter with highlighted redactions, not a grid of marketing cards. All alignment left; numbered steps represent the actual workflow.

Plan critique: avoid a generic SaaS dashboard. Keep only a small header and three views (Letter, Saved on device, Evidence). Make paste/select/drop and review the home screen. Move evaluation/config/raw evidence out of the primary task.

Manual mode is a supported no-Nano path, not proof of model detection. Regex suggestions can miss names/addresses and catch useful dates. Every cloud input must be explicitly declared synthetic, have at least one actual redaction, be reviewed, then approved at its current revision. Arbitrary reviewed synthetic text is allowed; fixture identity is not an authorization boundary. Never fall back to raw source.

History is opt-in IndexedDB in this browser only, with explicit save, individual delete and clear. It includes the restored draft and explanation, never automatically saves the original or network ledger. Reminders are local date notes shown only when the app is open, not background/push notifications. Browser data can be cleared; shared devices are not private.

Nano status and advanced device configuration are separate from manual review. Real Nano execution remains unverified on this host. Existing isolated broker, App Check and source CSP remain unchanged.

## Integration hooks for parent / lane B
- Main consumes the parent-provided compile-time `__DEVICE_CONFIG__`, guarded with typeof for local builds. No paste-config field. Local missing config is friendly and manual review remains available.
- Main currently retains original Nano detect + runJourney APIs, intentionally not importing lane B's pending hybrid API. Parent should wire hybrid local-answer into a distinct “Explain on this device” action and preserve result provenance (local model vs cloud vs sample template). The sample template is deliberately labelled not inference and only supports supplied examples.
- Manual review uses existing `gate.detect(regexSpans)` to enter review; it does not call `deviceUnavailable`. Any reviewed synthetic input may be approved. Synthetic declaration and exact-payload checkbox are separate and must both be checked. Edits rebuild controls and invalidate revision approval.
- Older `scripts/verify-reviewed-journey.mjs` and cloud browser scripts have old UI labels / one-checkbox expectations and need parent updates after integration. Do not mistake their historical pass for current UI QA.

## Verification
Run `npm run build && npm test && node tests/product-ui.browser.mjs`. The browser script uses the existing workspace Playwright installation (no dependency addition), serves dist with the unchanged Hosting source CSP at registered localhost port 5192, and launches isolated headless Chromium with --no-sandbox for VM diagnostics only. This is not sandboxed production or real model/attestation proof.

2026-11-12: typecheck + dual builds + 90 existing unit tests passed. Product browser QA passed at 390 / 768 / 1440 widths: no initial horizontal overflow; keyboard two-checkbox approval; arbitrary synthetic manual review + add/remove; approval invalidation; zero-redaction refusal; actual browser IndexedDB save/reload/delete/clear/context isolation; saved markup escaped; local file input. Zero external requests and zero page errors. Nano and cloud inference were not run. No deployment performed. Reminders do not run in the background. Only text import is supported.
