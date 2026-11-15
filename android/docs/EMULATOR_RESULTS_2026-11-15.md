# Actual Android emulator results — 2026-11-15

**PASS for the actual emulator cloud subset; PARTIAL overall, NOT full local Nano E2E. No release.**

## Latest source-bound proof

Branch `council/emulator-safe-completion`, tested source `3968e529dd6ace3a74bf1f88ebc25794b222234c`. [Actions 43737161647](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43737161647) completed SUCCESS. Debug/release/instrumentation builds, unit-test task and normal-release marker scan passed. There are 40 source unit-test methods; raw test reports/APKs were deliberately not exported from the runtime-secret workflow. Offline 13 source/recording guards, 6 scanner fixtures and 26 USB guards pass, ZERO physical adb operations. Normal Enterprise release provider/configuration and shared canonical bytes are unchanged. The common response prompt now explicitly requests the existing strict parser contract; no predicate was relaxed and no claims were repaired.

Sanitized receipts and source/media manifest: [evidence/emulator-safe-2026-11-15/](evidence/emulator-safe-2026-11-15/). The receipt is a synthetic test record, not personal notice content or a token.

## Logging blocker resolved before real-secret reuse

Examined the exact Maven 20.1.0 debug SDK source and compiled bytecode: `DebugAppCheckProvider` unconditionally calls `Log.d(TAG,message)` with the secret after resolution. Source JAR SHA256 `ebd1831a4bae4fed3036fbc28cb29a3136a317578fb6cd5ef58b3f2b2901c75d`. There is no provider-level supported switch around that call.

Per-tag-only ERROR controls still failed the PUBLIC unregistered SDK canary in [43734781091](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43734781091); NO registered secret was used. Do not assume a tag control worked just because setprop succeeded.

Supported Android liblog ERROR thresholds for both global defaults and explicit App Check tags, in BOTH `log.tag` and `persist.log.tag` namespaces, passed actual public-canary [43735526662](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43735526662) BEFORE new enrollment. Exact per-tag failure origin was not retained and is not claimed. Controls affect only the disposable runner emulator; no production logging/provider configuration was changed.

Every real run repeats the canary first: actual SDK construction and invalid-token exchange; `Log.isLoggable(DEBUG)==false`; public canary absent from ALL logcat buffers; positive ERROR-level liveness marker present. Only then is the registered secret read and injected through private stdin into preferences. The registered-token all-buffer privacy tripwire remains mandatory, unfiltered and checked before receipt export. Latest receipt proves `sdkSecretLogDetectedInPrivateMemory=false`. No raw logs, APKs, preferences, instrumentation output or Gradle device reports were exported.

## Actual parsed acceptance and exact SDK ledger

Actual registered **debug-development** App Check SDK token obtained, NOT native Enterprise production attestation. Actual Firebase Android hybrid SDK returned `In Cloud`. The unmodified strict parser accepted the response, the application stored an Accepted answer, and two ledger entries match the exact approved application string: ATTEMPT then In Cloud. Approval consumed once; session clear emptied source and ledger.

- Synthetic manual selection redacted Alex to [WRITER]; Alex is absent from SDK input.
- Approved input: **665 UTF-8 bytes**, SHA256 `4d5271a0b2e68dacc6dc5eae2349b8b38fec77478dc459e64a186c94792e1b0b`.
- Parsed explanation: “The notice instructs [WRITER] to pay £20 by Friday.”
- Parsed draft: “[WRITER], pay £20 by Friday.”
- Both cite exact evidence “Pay £20 by Friday.” Deadlines/actions/amounts arrays were empty. This is NOT completeness or accuracy validation.
- Full exact approved string, accepted structured answer and both entries are in `receipt.json`. These are application SDK-input bytes, NOT HTTP/TLS packets.

## Negative controls and earlier failure diagnosis

Actual SDK invalid public-debug-token exchange rejected with allowlisted APPCHECK_REJECTED category. In a separate disposable instrumentation process, a test-only provider supplied NO token (never an enforcement bypass); an actual Firebase AI SDK request was rejected with APPCHECK_REJECTED. Both receipts contain booleans/categories only, not backend error text. The override never enters normal application source and is cleared before registered-token use.

Earlier actual [43736187989](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43736187989) safely returned a real In Cloud SDK response but strict parsing rejected it: STRICT_KEYS_OR_EMPTY_CLAIM, one ATTEMPT entry, no Accepted answer. This proves the failure was at the strict shape/nonempty guard, not cloud transport; the exact narrower predicate was not captured, so none is invented. The prompt was ambiguous about exact fields/nonempty required arrays. It now explicitly requests them. Parser predicates are unchanged; public error codes ANSWER_ROOT_KEY_SET / ANSWER_CLAIM_KEY_SET / ANSWER_EMPTY_CLAIM / ANSWER_EMPTY_REQUIRED_ARRAY plus regression tests distinguish future failures without raw response logging. Latest run reports PASS_STRICT_UNMODIFIED, not a normalized or fixture answer.

Historical cf809b0 run43732816968 stopped on a real-secret privacy tripwire; earlier be37 footage showed only an attempt. Those are failures/partial evidence, not retroactively successful.

## Footage — explicitly PARTIAL

Latest artifact `labelled-emulator-development-3968e529dd6ace3a74bf1f88ebc25794b222234c` contains a continuous **32.134777s,720×1410** MP4. Labels state PARTIAL EMULATOR FLOW, Nano unavailable, development DEBUG App Check, SDK ledger NOT HTTP/production attestation. Sample frames were inspected: labels are unclipped, manual-redaction UI and actual accepted synthetic answer/TEST_ONLY mutation are visible. No fixture cloud reply.

MP4 SHA256 `eccbd41e59144623397edcd3ed0dd71a0acc98fb3cf61beb17886f09e53cdf05`. Media is not committed or publicly released. Private downloaded copy: workspace `.openclaw/tmp/safe-send-safe-evidence-final/labelled-emulator-development-3968e529dd6ace3a74bf1f88ebc25794b222234c/labelled-emulator.mp4`. Artifact retention 7 days.

## Cleanup verified 16:51:28 UTC

Temporary Android debug enrollment deleted, exact registration GET404. GitHub SAFE_SEND_EMULATOR_DEBUG_TOKEN deleted and secret list empty; revoked local registration file removed. Runner finally force-stopped and cleared app/preferences and logcat, then emulator terminated and ephemeral runner completed/discarded. App Check firebaseml.googleapis.com ENFORCED; Enterprise threshold0.5/TTL3600 unchanged; billing readback HTTP200, billingEnabled=false. An earlier transient billing readback403 was reconciled to HTTP200/false; token deletion had already succeeded.

## Still blocked / not claimed

Nano actually reported UNKNOWN / unavailable, device model UNKNOWN. No local text/photo inference, private two-key verification/unredaction, semantic wrong-deadline detection or full-flow recording is proven. The planted wrong-deadline object is TEST_ONLY, separate from Accepted, NOT Nano evidence. Normal-release Enterprise token acceptance, supported physical hardware and native accuracy/parity remain NOT_RUN. Owner need not run tests; these remaining operator-owned hardware prerequisites are outside this emulator's capability. No physical adb, Mac, phone/network/Tailscale change, billing/card, Hosting deploy, public release or organizer contact occurred.
