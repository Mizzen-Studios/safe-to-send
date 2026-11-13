# Judge access — PLAN ONLY; no release authorized

Use existing Firebase Spark project safe-to-send-2026, package com.mizzen.safetosend. No new project, paid resources, card, Blaze upgrade, public release, posting, Play Store account/listing or submission. Debug APK is assistant/operator-only. Offline/manual is a valid separate capability when cloud is unavailable; it is not a production-attested cloud demo.

## Selected provider: native Android reCAPTCHA Enterprise (Preview)

Council 3 supersedes the earlier Play Integrity-only investigation. Current Firebase documentation explicitly supports native Android reCAPTCHA Enterprise on Spark with an Android-type key, without Play Console. The provider is Preview and is not Play Integrity hardware attestation. Use a separate Android key for com.mizzen.safetosend, not the web key or browser tokens. See [verified provider, model identity and session research](../../docs/ANDROID_PROVIDER_AND_MODEL_RESEARCH.md).

Remaining gate is configuration and actual proof: register the existing-project Android app/provider without billing changes, compile the native provider, obtain a normal non-debug accepted token/cloud response, and test missing/invalid-token rejection under unchanged enforcement. These are NOT_RUN. Do not disable enforcement, lower risk thresholds to bypass rejection, ship debug tokens or call a private debug APK judge-ready. Keep the documented default risk threshold unless separately reviewed. No Play Console is needed for this selected route; Play Integrity-specific prerequisites no longer block this plan.

## Future GitHub Release checklist (PLAN ONLY)

1. First integrate complete app and safe UI/export with parent; pass build/unit/privacy tests and real physical-device acceptance. Preserve source SHA and reproducible artifact provenance. No release created in this lane.
2. Decide explicitly whether judge path is offline/manual-only or genuine production-attested hybrid. Label feature limitations plainly. Cloud/hybrid release remains blocked until normal signed sideloaded APK gets real production App Check and positive cloud response, plus missing/invalid-token negative controls under unchanged enforcement. Debug operator proof never clears this gate.
3. Prepare production-signed non-debug APK, stable applicationId, version/code, min SDK, signer certificate fingerprint and SHA256 manifest; protect signing material outside repo/artifacts/logs. Never commit tokens, keystore, service-account keys or debug-provider configuration. Verify release dependency/manifest excludes debug provider and exported test entrypoints. No signature/data-wipe workaround.
4. Prepare release notes and direct APK/checksum/source links for a GitHub Release ONLY after separate publication authorization. Explain Android sideload warning honestly; never ask to disable Play Protect. Judge device may lack Nano: show unavailable state and local/manual route, not claimed Nano success. Supported device still requires actual availability/download.
5. Supply short synthetic in-app walk-through, permission/minimal data policy, offline/local behavior, cloud approval boundary, known limitations, expected download time/storage and source/receipt references. No personal test data or credential access required. Assistant tests clean judge install/update path and records synthetic footage; Olly need not perform tests.
6. Verify judge download hash/signature and documented independent production access before calling release judge-ready. Actual release creation/upload, public links/posts, Store/submission and paid changes are all outside this authorization.

Current status: plan prepared; release NOT_CREATED; phone Nano NOT_RUN; production cloud attestation UNVERIFIED; offline/manual runtime NOT_RUN pending builder.
