# Release recheck — 2026-11-15

> Later same-day update: current source rebuilt and privately signed; see [refreshed candidate](SIGNED_PRIVATE_REFRESH_2026-11-15.md). This document preserves the historical artifact/recheck and its then-current limitations.

**HOLD PRIVATE / REBUILD REQUIRED. Configuration and artifact verification, not production acceptance.** Baseline 7930eec; isolated council/release-roughcut. Parent owns integration and any later build.

Authenticated GET readback confirms the existing native Android app 1:794092402064:android:fd7223549ef6ecf5a8af15, exact package com.mizzen.safetosend, existing Android Enterprise key/provider, score threshold 0.5 and TTL 3600s. Package verification enabled, exact package allowlist, non-Google-store distribution enabled, no testingOptions. Firebase AI service remains ENFORCED. Authenticated gcloud billing projects describe confirms billingEnabled=false and empty account. REST billing with project quota override returned403; the existing CLI read succeeded. No API enablement/configuration write, new resource, debug registration, billing change or token exchange occurred.

## Actual existing signed artifact

- Source c441d021a8cfaf2fa9e88e009d1479193056b88f, NOT current source.
- APK SHA256 8783e39d6864755889945688b23182cdec4dc18a2a89e86607c2012d551daa34.
- Independently rerun apksigner: v2/v3 valid, one RSA3072 signer; certificate SHA256 74c8f082a40849d3edd6d40ad41972dd0861895541c776cdf0c72f1585213d19.
- Binary AndroidManifest inspected: package com.mizzen.safetosend, version0.1.0/code1; no debuggable=true attribute. Existing exact-build receipt says non-debuggable.
- Release marker scan PASS. Native RecaptchaAppCheckProviderFactory present in DEX; DebugAppCheckProviderFactory absent. All three embedded client config values privately compared against owner-only properties; exact app/site key aligned with authenticated configuration. Values were not printed.
- Byte-level ZIP alignment independently PASS:276 stored entries4-byte,8 native libraries16KiB. ARM-host zipalign binary not executed.
- Current release source sets use releaseImplementation firebase-appcheck-recaptcha20.1.0 and debugImplementation firebase-appcheck-debug20.1.0. Release Attestation installs native factory on the initialized Firebase app before provider service access. Blank provider configuration blocks cloud dispatch. No debug fallback in release source.

## Material source drift

Current Ai.kt includes a fixed fenced-JSON parser (actual triple backticks rather than old literal escaped sequence), pre-trim, explicit schema diagnostics and strengthened response prompt. It also maps on-device availability enums into readable states. The c441d02 artifact predates these changes. **Rebuild and privately sign current reviewed source using existing approved key; rerun exact-tip CI/scanner/config/signature checks before any future device session.** This task did not rebuild, sign or publish anything. Parent must not describe the old APK as covering the accepted emulator source3968e52 or current parser.

## Honest next option

The already configured [native Android reCAPTCHA Enterprise provider (Preview)](https://firebase.google.com/docs/app-check/android/recaptcha-enterprise-provider) is the Spark/no-Play-Console option. No new resource is needed. It is not Play Integrity and a certificate fingerprint alone is not an attestation verdict. Real authorized supported-device normal-token acquisition plus enforced approved-redacted Firebase AI acceptance and negative controls remain **NOT_RUN**. Emulator development acceptance cannot satisfy production-token/physical-Pixel gates. Do not relax enforcement, lower threshold, create test keys, register debug tokens, enable billing, or promise emulator production acceptance. Actual component/model identity UNKNOWN.

Sanitized live receipt: docs/evidence/RELEASE_RECHECK_2026-11-15.json. Private artifact remains outside Git in workspace scratch; no private token/key material included in this receipt. Existing CLI authentication was used in-memory for read-only calls and owner-only client properties were used for private byte comparison.
