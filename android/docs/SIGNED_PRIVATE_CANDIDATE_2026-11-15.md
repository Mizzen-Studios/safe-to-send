# Configured signed private Android candidate — 2026-11-15

**HOLD PRIVATE. Preparation only; no release, install, phone operation or inference claim.**

## Exact build and tests

Source **c441d021a8cfaf2fa9e88e009d1479193056b88f**, branch council/native-final-build. [Free CI43720635626](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43720635626) completed SUCCESS: actual pinned Firebase SDK/KSP compilation, debug/release/test assembly, **36 unit tests, zero failures/ignored**, **8 API35 emulator TEST_ONLY tests, zero failures/errors/skips**. Downloaded HTML/XML independently inspected. Existing 32/8 historical receipts remain historical and unchanged. Superseded run43720520966 failed one validation-exception test; fixed in this exact source, not hidden or called green.

Local guards: 10 source-contract, 6 scanner fixtures, 26 offline USB cases pass; ZERO physical adb commands. Canonical asset SHA256 faec5df849675cd64efe3089eac5070d4e35d169ef969ed8e879bd2956f94354.

Artifact14164467966 archive digest sha256:8ea9d8228e69e98595cc79afb34898b949b434c34837aaca756750654757fa4c, seven-day retention. Its unsigned configured release SHA256 **050091941caaa4672503146fbea3330e1aed53917a1aff67e100fbc5193652b1**. CI artifact contains no signing key/password or debug token. The debug APK is test-only, never the private signed deliverable.

## Public client configuration approach

Local Linux host has JDK and SDK but x86_64 aapt/zipalign cannot run on its ARM64 userspace (missing x86_64 loader). Therefore existing free x86_64 CI built the actual configured source APK. The opt-in android_client_config boolean runs an explicit three-field allowlist helper with **public Firebase client app ID/API key and Android reCAPTCHA site key only**, not server credentials. These identifiers are necessarily embedded in a client APK; helper is visible in this public source branch. No repository secrets were created. No private properties file, signing key/password, enrollment/debug token or production token was uploaded. CI uses normal release RecaptchaAppCheckProviderFactory; token acceptance is NOT_RUN.

The supplied owner-only properties were copied 0600 to ignored android/private.properties and compared offline against all three embedded release DEX values. Exact Android app **1:794092402064:android:fd7223549ef6ecf5a8af15**, package **com.mizzen.safetosend**. Canonical asset bytes match source exactly; release provider class present, debug provider/token markers absent. Cloud configuration receipt remains [the prior readback](../../docs/NATIVE_ANDROID_APPCHECK_CONFIG_2026-11-15.md): Enterprise threshold0.5, TTL3600s, billing disabled/Spark, existing enforcement unchanged. This build performed no cloud changes and does not independently re-prove a normal token.

## Local signing and final bytes

Generated dedicated RSA3072 PKCS12 private-preview identity in OpenClaw secret storage, keystore and independent random-password file both0600, directory0700. It is not the Android debug key. Password passed to existing SDK apksigner through private process environment; no credential output or upload. Signed configured CI release locally, then verified **APK Signature Scheme v2 and v3 PASS; one signer**.

- Final filename: safe-to-send-0.1.0-c441d021a8cfaf2fa9e88e009d1479193056b88f-private-signed.apk
- Final APK SHA256: **8783e39d6864755889945688b23182cdec4dc18a2a89e86607c2012d551daa34**
- Signer certificate SHA256: **74c8f082a40849d3edd6d40ad41972dd0861895541c776cdf0c72f1585213d19**
- Package com.mizzen.safetosend; version0.1.0/code1; min26/target36; **non-debuggable**. aapt badging/manifest inspected in exact CI build; signing preserves ZIP content.
- Final signed release marker scan PASS. This is a bounded marker guard, not a universal secret-proof certificate.
- Existing AGP packaging already aligned: independently checked all276 stored entries on4-byte boundaries and all8 native libraries on16KiB boundaries. No realignment mutation required. Local zipalign binary unavailable on ARM64; byte-level ZIP offset inspection is the stated verification, not a fabricated zipalign invocation.
- Private artifact and receipt retained under workspace .openclaw/tmp/safe-send-native-final-artifacts/; final APK0600, enclosing directory0700. Signature verification text and SIGNED_PRIVATE_RECEIPT.json retained there. Final signed bytes were NOT uploaded to Actions, Git or GitHub Releases.

## Native protocol and honest limits

Native @Generable field names/list bounds mirror quotes-v2-fixed. Wire statuses MATCH/MISMATCH/UNSURE (case tolerance only), fenced JSON tolerated; IDs/quotes never normalized or repaired. Missing checks and invalid evidence remain UNKNOWN; unknown/duplicate IDs and unknown domains fail closed. Every explanation/draft/deadline/action/amount claim is covered. Entire-line verbatim support is deliberately conservative; paraphrases and MISMATCH remain UNKNOWN, not measured deterministic contradiction. Original restoration, immutable Accepted Answer/receipt identity and isolated TEST_ONLY planted deadline remain intact; eight emulator fixtures do not masquerade as Nano.

Web remains primary; latest parent evaluation3/128 decidable and one typed-evidence catch do NOT establish native accuracy/parity or Nano semantic detection. No native accuracy benchmark was run. UI states native experimental/unvalidated and production attestation/phone inference NOT_RUN.

## Remaining blocked gates and handoff

Physical device operations remain unauthorized: actual Nano availability/model identity/text/photo accuracy, camera/gallery privacy, native production App Check token + approved-redacted Firebase AI acceptance and missing/invalid-token rejection, actual semantic wrong-deadline behavior, recording, and any transport observation remain **NOT_RUN**. Do not lower enforcement/threshold, enroll debug tokens, enable billing, or substitute TEST_ONLY fixtures. Signer certificate is recorded, not an attestation registration/acceptance claim. Parent owns integration/review and any later release decision.

For a separately authorized remote Mac/device session, prerequisites must ALREADY exist: remotely controllable macOS, JDK17+, Android SDK platform-tools adb, build-tools36.0.0 aapt/apksigner/zipalign, authorized unlocked compatible phone and Nano runtime. No Mac installation, physical adb operation or owner-run setup was performed/requested. Local installation viability itself remains untested. No hosting, paid resources, Play Console, organizer contact or public release.
