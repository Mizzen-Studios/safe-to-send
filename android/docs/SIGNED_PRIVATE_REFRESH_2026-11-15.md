# Refreshed configured signed private candidate — 2026-11-15

**HOLD PRIVATE. Current candidate replaces the old c441d02 build for future authorized testing, not production acceptance.** Historical APK and receipts remain untouched.

## Exact source and CI

Source **440ec1e0aa70644ecde8288e8dc2d6f93e302b2f** includes current Ai.kt prompt/fenced-JSON parser from 3968e529dd6ace3a74bf1f88ebc25794b222234c. No application, workflow, cloud or web source changes were needed. [Free standard CI43751474600](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43751474600) **SUCCESS**, with android_client_config=true and only the existing three-field public client allowlist. Pinned SDK compilation, debug/release/instrumentation assembly, wrapper checksum, package metadata and release marker scan all passed.

Downloaded reports independently inspected: **40 unit tests passed, zero failures/ignored; API35 emulator10 discovered,8 passed,2 skipped, zero failures/errors**. The optional actual-cloud and logging tests were skipped. These are debug UI/TEST_ONLY tests, not execution of the signed release or production attestation/Nano proof. Local guards:10 source contracts,6 scanner fixtures,26 offline USB cases and1 VM fake-adb tripwire test pass; zero physical adb/device operations.

## Final bytes and independent verification

- Unsigned APK SHA256: a1ab7c78b6b4c5e63391d4ac3a89155fc4658347db582e1606f9c6f8c8c86dfa.
- Signed APK SHA256: **106b8d58e9aa2cd31dd08da7ad562f44102dfcd691b36ed4d93cc082971ba5c3**.
- Certificate SHA256: **74c8f082a40849d3edd6d40ad41972dd0861895541c776cdf0c72f1585213d19**; expected existing private identity, one signer; apksigner **v2/v3 PASS**.
- Package com.mizzen.safetosend, version0.1.0/code1, min26/target36; release manifest and badging confirm **non-debuggable**.
- Native Enterprise RecaptchaAppCheckProviderFactory present; DebugAppCheckProviderFactory absent. All three embedded public client values exactly match existing owner-only properties and expected Firebase Android app. Release source installs the existing native provider, never a debug fallback.
- Shared contract exact byte match, SHA256 **faec5df849675cd64efe3089eac5070d4e35d169ef969ed8e879bd2956f94354**.
- Final release marker and known-secret scans **PASS**. All decompressed entries privately checked against existing signing password/keystore and credential/token strings in owner-only JSON. No matched secret values printed. This is bounded detection, not a universal secret-proof certificate.
- All original unsigned ZIP entries byte-identical after signing; only three normal META-INF v1 signing entries added. Initial overly strict identical-entry-list assertion caught these expected additions; verification was narrowed to exact original bytes and exact signing-only additions, with no resign/rebuild or app change.
- Independent ZIP-offset verification:276 stored entries4-byte aligned,8 native libraries16KiB aligned. No unsupported ARM-host zipalign invocation claimed.

Existing PKCS12 key/password files stayed0600 in secret storage; password used only through private process environment for local SDK apksigner. Nothing regenerated or uploaded. Signed APK0600, parent directory0700:

	home-relative workspace .openclaw/tmp/safe-send-release-refresh-artifacts/safe-to-send-0.1.0-440ec1e0aa70644ecde8288e8dc2d6f93e302b2f-private-signed.apk

Full exact absolute path, artifact14176876994 archive digest, CI/test counts, config booleans and hashes: [sanitized receipt](../../docs/evidence/SIGNED_PRIVATE_REFRESH_2026-11-15.json). Private signature output and downloaded reports remain alongside the APK. Signed bytes never uploaded to Git, Actions or GitHub Releases.

## Unchanged gates

Same-day authenticated configuration readback in RELEASE_RECHECK_2026-11-15.md remains the configuration evidence: threshold0.5,TTL3600,FirebaseAI ENFORCED,billing disabled. This build/sign task made no cloud configuration/resource/debug registration/billing changes and claims no new readback.

**Normal production App Check token, enforced approved-redacted cloud acceptance/negative controls, physical-device Nano/model/text/photo accuracy, installation and recording remain NOT_RUN. Emulator production acceptance NOT_RUN; model UNKNOWN.** No Mac installs, physical adb/phone operations, contact, Hosting deploy, paid resource or public release. Parent owns receipt integration; docs-only follow-up commit does not change the built application source. No new Hosting deployment is required.
