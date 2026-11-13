# Pixel 9 Pro: assistant-operated USB acceptance plan

**NOT_RUN.** Wait for the physical phone later connected by USB to authorized Mac. Complete/build app first. Do not ask Olly to run setup/tests/recording. Emulator CI is build/UI evidence only, never Nano or production device attestation evidence.

## Safe operator sequence

1. Assistant gains authorized private remote control of Mac. Use existing platform-tools and SDK build-tools aapt; if absent, stop for approved setup rather than downloading unsolicited tools. Privately confirm USB debugging authorization; never capture unlock codes, notifications or personal screens. No root, bootloader unlock, Play Protect bypass, adb tcpip, exposed ports, purchases, billing linkage, resources changes or Spark upgrade.
2. Select exact physical USB serial privately. Helper rejects TCP/IP serials, emulator serials, unauthorized/offline states and missing USB transport. Inspect model/OS and normal locked-device context; this transport guard is not cryptographic proof of integrity.
3. Obtain APK and SHA256 from builder's independent build receipt. Verify package, SHA and intended signing certificate via local Android SDK tools; use helper install absolute APK and hash. install -r preserves app data. Signature mismatch stops: no uninstall/data wipe workaround. Debug APK is private operator-only, never judge artifact.
4. Open app through actual launcher UI. Parent fills actual controls/selectors/export fields after builder integration. Do not use invented activities, broadcasts, adb service commands or hidden test intents. Until controls exist, capability/evaluation is BLOCKED, not simulated success.
5. Work only with synthetic text and synthetic letter photographs. Import through implemented picker/paste UI, no private gallery browsing in footage. Photo OCR/detection/answers remain ONLY_ON_DEVICE or manual local; no raw image or original text cloud path.

## Acceptance matrix (record PASS/FAIL/NOT_RUN/UNAVAILABLE/ERROR separately)

- Availability UI: fresh checkStatus result, explicit DOWNLOADABLE confirmation, started/progress/completed/failed, downloading interaction, unavailable and recoverable errors. Do not clear AICore data or force reinstall to manufacture states. Only states actually observed are measured; injected unit states are labelled unit tests. Log exposed model version or UNKNOWN, app/source SHA, hardware/OS, clock and cold versus warm timing. Download network activity is not prompt upload; test inference boundary separately.
- ONLY_ON_DEVICE text and one-Bitmap photo requests: actual output/schema validation, cancellation, no silent cloud fallback on unavailable/error/unsupported input. Manual redaction remains usable without Nano; offline/manual behavior must be tested independent of cloud.
- Mandatory review: include missed synthetic PII manually, remove/resize redactions, change original, change photo, change placeholder mapping/roles, regenerate result and edit proposed payload after approval. Every relevant mutation invalidates approval and accepted-cloud provenance. No send without fresh explicit approval; stale/replayed approval fails closed.
- Exact outbound contract: snapshot approved immutable redacted payload, exact serialized UTF-8 HTTP body, byte count and SHA256; independently compare transport-observed body to ledger if actual instrumented interface supports this. A ledger alone is not network proof. SDK prompt length/hash is NOT full HTTP-body evidence; unavailable transport observer/export = BLOCKED for exact-byte proof. No raw sentinel, original/photo, local map or restoration values in outbound bodies. Avoid headers, tokens, HAR and full logcat.
- Approved-redacted hybrid only: exercise actual on-device answer and accepted cloud answer/fallback, separately label source and errors. No branch on raw original may use PREFER_ON_DEVICE/PREFER_IN_CLOUD. No unreviewed retry/fallback sends.
- App Check negative controls (operator controlled, only when a safe implemented harness exists): missing and invalid attestation rejected by enforced service; no successful answer or approval bypass; positive production-attested call separately. Record sanitized status/error, never token. Do not disable enforcement or ship debug credential workaround. Unimplemented harness = BLOCKED.
- Two-key checks over BOTH explanation and draft: unsupported names, amounts, dates, deadlines, invented contact details, contradictory claims, cross-section-only omissions and altered placeholders. Require complete current local-verification coverage, not a section-level boolean. Include unavailable/malformed/error verifier and a plausible false negative; never claim perfect detection.
- Provenance must be opaque, internally minted only for accepted current cloud response and exact approved payload/revision; UI edits, local/manual text, stale hashes, replay, forged source labels or exported/reimported text cannot mint accepted-cloud provenance. Verify locally restored output is NOT reused as cloud input.
- Role-aware placeholders: distinguish sender/recipient, agency/person and repeated values, preserve role and stable mapping, unknown role stays explicit; no person/agency swap in restored draft. Test identical literal values in different roles and raw placeholder-like input.

## Synthetic evaluation subset (3–5 letters)

Select four versioned synthetic notices (benefit, tax, utility, appointment) from existing corpus once builder supports input. Freeze IDs/source hashes before running; keep groundtruth in evaluator-only files, never in app/model prompt or modelinput export. Separate synthetic source/image and modelinput manifests from expected spans/claims. Photos should include legible and difficult synthetic variants; manual review is mandatory, not model groundtruth.

For each attempt retain input ID/hash, route, capability state, response/schema/error, detected offsets, reviewed edits, latency, local answer checks and sanitized ledger. Report Nano-only, regex-only and combined character-level precision/recall from independent spans with exact numerator/denominator; small subset is smoke evidence, NOT full-corpus/general accuracy. Unknown/unavailable/error/timeout are distinct and included in attempted denominator, not silently scored zero or excluded. Do not infer catch rate from handpicked examples or substitute fixtures for model output. Never claim successful phone evaluation now.

## Bounded private recording

Assistant sets privacy-safe screen and synthetic app before recording. Run helper record (175 seconds maximum); note exact generated safe-to-send timestamp/PID basename. If any secret/personal content appears, stop and quarantine footage, do not publish. pull accepts only that namespace and existing absolute private output directory, refuses overwrites. Decode and inspect beginning/middle/end and all secret-sensitive transitions; retain SHA256 and source/app version. cleanup removes one exact helper recording path only, after verified local copy. No broad deletes, logcat collection or app-data cleanup. Availability/evaluate helper commands intentionally report UNAVAILABLE; app UI/export is the only capability/eval interface after implemented.

Example later operator commands (placeholders, not device evidence):

    bash android/scripts/pixel-usb.sh --serial USB_SERIAL install /absolute/operator/app.apk INDEPENDENT_SHA256
    bash android/scripts/pixel-usb.sh --serial USB_SERIAL record
    bash android/scripts/pixel-usb.sh --serial USB_SERIAL pull safe-to-send-20261113T010000Z-123.mp4 /absolute/private/output
    bash android/scripts/pixel-usb.sh --serial USB_SERIAL cleanup safe-to-send-20261113T010000Z-123.mp4

No adb device operations were performed preparing these instructions.
