# Native Android App Check configuration — 2026-11-15

Classification: **CONFIGURATION READBACK ONLY — NOT TOKEN ACCEPTANCE**.
Owner authorized this cloud setup on 2026-11-15, Spark-only, no billing/card/Play Console/device operations or release. Source baseline 7843304; isolated branch council/native-appcheck-config. No Kotlin or app sources changed.

## Configured and independently read back

- Existing project safe-to-send-2026, number 794092402064.
- Preflight found zero Android apps and only the existing web-type reCAPTCHA key. Created exactly one Android registration: app ID **1:794092402064:android:fd7223549ef6ecf5a8af15**, package **com.mizzen.safetosend**, display name Safe to Send Android.
- Android-type production reCAPTCHA resource: **projects/794092402064/keys/6LeIciEuAAAAAIEYGD-hchOsfTZevc_TRAvSJN4O**. Package verification remains enabled, only this exact package is allowed. Non-Google-app-store distribution support enabled for the no-Play-Console distribution route. No test score/testingOptions.
- Provider binding: **projects/794092402064/apps/1:794092402064:android:fd7223549ef6ecf5a8af15/recaptchaEnterpriseConfig**. Android site key above, minValidScore **0.5**, tokenTtl **3600s**.
- API-key resource identifier (not its value): c5e53fd0-8b9f-46f4-af43-0557ce110d39.
- Existing Firebase AI App Check service **projects/794092402064/services/firebaseml.googleapis.com** remains **ENFORCED**; complete before/after service responses, including updateTime and etag, are identical.
- Cloud Billing billingInfo before and after: billingEnabled **false**, billingAccountName **empty**. No billing account linked, so Spark remains unchanged. No payment request encountered. The Cloud Billing API was NOT enabled: reads used the already authenticated CLI consumer, without changing project configuration.
- Enabled API set unchanged; required reCAPTCHA Enterprise, Firebase Management and App Check APIs were already enabled. Existing web key unchanged; web provider readback still threshold 0.5, TTL 3600s. No deployment, release, Play Console, token minting, debug registration or enforcement relaxation performed.

Machine-readable sanitized receipt: [evidence/NATIVE_ANDROID_APPCHECK_CONFIG_2026-11-15.json](evidence/NATIVE_ANDROID_APPCHECK_CONFIG_2026-11-15.json).

## Private build configuration handoff

Owner-only files (0600) are retained outside Git at /home/ubuntu/.openclaw/.secrets/safe-to-send/:

- android-google-services.json: actual Firebase Android client configuration, not a web config.
- android-private.properties: firebase.appId, firebase.apiKey, appcheck.androidSiteKey matching the existing Android Gradle contract. No debug token is present.

The operator/builder can securely copy the latter to ignored android/private.properties in their own authorized build checkout. This configuration task did not modify that shared file or another worker's sources. Do not print config values into logs or commit the private file. Public Firebase app ID and Android site-key metadata above are identifiers, not App Check tokens or server credentials.

## Remaining gates — NOT RUN

- Build a signed non-debug/release variant using native RecaptchaAppCheckProviderFactory before Firebase service access, with these registered Android client values. Existing debug variant uses the debug provider and is not normal-token evidence; this task did not use it.
- On an authorized real supported device, obtain a genuine native production provider token and demonstrate an approved-redacted Firebase AI Logic request accepted with unchanged enforcement. Separately demonstrate missing/invalid-token rejection. Never persist/log token contents.
- Emulators/CI can be considered invalid by App Check; an emulator run must not be promised as production attestation proof. Do not lower score threshold, use test-score keys, register debug tokens, or mint custom tokens to circumvent this gate.
- No Nano inference, actual model identity, physical-device readiness or judge readiness is established by cloud configuration readback. Native reCAPTCHA Enterprise Preview is not a Play Integrity hardware verdict.
- Spark is not unlimited: official App Check overview describes a no-cost monthly allowance of 10,000 reCAPTCHA assessments; refresh is normally roughly twice per hour at this TTL. Do not upgrade billing or repeatedly force token refresh. Remaining quota was not measured.

## Official documentation checked

Fetched 2026-11-15 UTC: [native Android provider (Preview)](https://firebase.google.com/docs/app-check/android/recaptcha-enterprise-provider), [Android score-based key instructions](https://firebase.google.com/docs/app-check/recaptcha-keys), and live public Discovery schemas for Firebase Management v1beta1, reCAPTCHA Enterprise v1, Firebase App Check v1. Native guide explicitly supports Spark at threshold 0.5 and a normal default one-hour TTL. BoM minimum 34.17.0+, current documented standalone firebase-appcheck-recaptcha 20.1.0. No browser automation was required.

Verification: authenticated REST reads/assertions for exact project/package/provider/key/TTL/threshold, no duplicates, unchanged billing/API set/web key/service enforcement; sanitized receipt parsed and checked before commit. No runtime build/test was appropriate for this docs-only configuration receipt; device/token/AI gates remain explicitly NOT_RUN.
