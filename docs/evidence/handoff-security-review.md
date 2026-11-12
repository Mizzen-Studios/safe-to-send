# Safe to Send — focused handoff review

Reviewed clean HEAD `9d1ff9cf030b47e9b8c6033d3cc5cab3c84e96ce`, read-only source inspection. Only this requested report was written; no target execution, builds, cloud calls, account changes or source edits. This is a focused independent review, not a comprehensive audit.

## Verdict

**No demonstrated cross-origin/raw-source/body-verification security blocker for parent-controlled synthetic private testing.** Parent may enable in a controlled private test build, then verify actual deployed-browser request parity and App Check. **A bare flag flip is not a synthetic-only public release:** the source also unlocks the Nano-reviewed arbitrary-text cloud path.

### Release-scope blocker: synthetic-only authorization is not enforced

`src/main.ts:42–46,48,51,55` enables the non-synthetic send action whenever `CLOUD_RELEASE_ENABLED` is true. The editable letter can contain arbitrary text; successful Nano detection plus review authorizes that path. `src/cloud-policy.ts:2` therefore unlocks more than the currently authorized synthetic verification. This is a release-scope mismatch, not an observed redaction bypass or exploit.

Minimal fix before public deployment: keep cloud sends unavailable outside the fixture-only journey (guard both action creation and explainCloud entry), and revalidate that the original text equals the chosen supplied fixture before send. For the current controlled private tests, constrain execution to unchanged supplied fixtures; do not describe flag-enabled deployment as technically synthetic-only until guarded.

## Boundary evidence

- Raw/image/mapping: `privacy.ts:28–39` freezes approval to a revision and serializes only instruction/redacted letter; only that string reaches `handoff-client.ts:9–12,33`. Frame URL is constant, referrer suppressed. Broker has no raw source, image or mapping argument. App Check is not a redaction/anonymity control; detector misses and deliberately removed spans can remain in the explicitly approved letter.
- Messages/replay: exact keys, binding and canonical payload (`handoff-protocol.ts:5–19`); exact origin AND source (`:38`); one broker request consumed before await (`broker-handler.ts:8–11`). Client checks nonce/request/revision, rejects reload and cancels/removes frame (`handoff-client.ts:15–34`), including a second revision check after digest. No concrete replay/foreign-window acceptance found. Cancellation does not undo already-dispatched network work.
- Wire validation: exact endpoint, method, single dispatch and body check occur before original fetch (`wire-capture.ts:9–18`); schema allows only one text part equal to the approval, fixed response schema, and empty safety settings (`handoff-protocol.ts:23–35`). Pinned SDK browser code resolves global fetch at dispatch (`node_modules/@firebase/ai/dist/esm/index.esm.js:1587`); no reachable current SDK bypass found. Other origins pass through the hook (`wire-capture.ts:13`), so it is not a universal outbound firewall; broker CSP and isolation remain material controls. Captured hash/body is attempted-dispatch evidence, not independent receipt or successful inference proof.
- SDK fallback: raw adapter explicitly uses ONLY_ON_DEVICE without cloud params (`nano.ts:9–12,17–21`); pinned SDK switch refuses fallback for that mode (`@firebase/ai/dist/esm/index.esm.js:2559–2566`). Raw CSP `firebase.json:22` blocks HTTP fetch connections while permitting local data-image conversion. Broker uses ONLY_IN_CLOUD (`cloud.ts:21–23`). A post-response inferenceSource check alone would not prevent egress, but it is not the only control here.
- App Check: same-app nonempty attestation before AI creation (`broker-main.ts:20–26`, `cloud.ts:12–23`), no shipped debug-token setup. Accept parent-reported enforced server policy, valid private debug attestation and missing-token 401 as separate external evidence, not independently re-tested here. Real Enterprise browser attestation under broker CSP/domain registration remains an integration prerequisite; private debug success does not prove it. Failure is closed before model creation.
- Placeholders/DOM: reserved source placeholders rejected and unknown/malformed output placeholders refused (`privacy.ts:12–19`); structure validated before restoration (`journey.ts:8–29`). Model/source strings render with textContent/value/text nodes (`main.ts:18–24,31,37`); innerHTML assignments are static markup or numeric scores (`:9,59`). No concrete DOM XSS sink found. Output can still be inaccurate or omit placeholders: not legal-accuracy evidence.

## Follow-up to parent proposed controls

Agree with keeping raw/Nano cloud independently source-locked and enabling only explicit unchanged-fixture cloud verification. Rejecting zero redactions before approval AND immediately before dispatch closes the full-original edge case; also require preview !== raw as the actual invariant. One remaining redaction does not establish anonymity, so retain mandatory review and synthetic-only scope. Recheck fixture identity at dispatch, not only when entering demo mode; UI syntheticMode alone is not sufficient.

The observed Enterprise script GET without App Check exchange indicates an unresolved integration failure, not proof of inference or enforcement failure. Keep closed; diagnose sanitized SDK error/CSP violations privately. Do not loosen raw-origin CSP or introduce tokenless fallback. Debug attestation success elsewhere is not proof this iframe initialized App Check.

## Parent-owned remaining proof

Proceed with unchanged synthetic fixture only: actual app E2E inference, independent CDP body/ledger equality and absence of raw sentinels across requests/URLs; real browser App Check behavior; deployed CSP/asset parity. No test/build run claimed by this review. Existing mocked serialization and demo fixtures are not actual inference; independent real SDK success is not app E2E. Keep release claims bounded accordingly.
