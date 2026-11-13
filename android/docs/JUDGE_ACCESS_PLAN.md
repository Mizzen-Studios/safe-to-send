# Judge access — PLAN ONLY; no release authorized

Use existing Firebase Spark project safe-to-send-2026, package com.mizzen.safetosend. No new project, paid resources, card, Blaze upgrade, public release, posting, Play Store account/listing or submission. Debug APK is assistant/operator-only. Offline/manual is a valid separate capability when cloud is unavailable; it is not a production-attested cloud demo.

## Attestation investigation: concrete blocker, not a bypass

Official Firebase Play Integrity provider guide (checked 13 November 2026) says it supports apps distributed on Play, outside Play, or both. However its required setup still explicitly instructs selecting/adding app in Google Play Console, App integrity → Play Integrity API → Link Cloud project, selecting the SAME Firebase project. Outside-Play acceptance settings (PLAY_RECOGNIZED not required; LICENSED not required; device integrity required) change accepted verdicts, not those setup prerequisites. We have not configured them.

User forbids a Play Console account. No official Firebase built-in Play Integrity Cloud-only setup was established in this investigation. The Firebase REST PlayIntegrityConfig reference documents verdict requirements, not an alternative onboarding procedure. Its optional BASIC/STRONG labels even require Play Console opt-in. Do not guess that merely enabling an API in Cloud Console supplies a working Firebase attestation linkage.

The underlying Android Play Integrity setup source was attempted at https://developer.android.com/google/play/integrity/setup and ?hl=en but fetch hit redirect limit; do not claim its current text was verified. Underlying API outside-Play availability would not by itself prove Firebase built-in integration supports a Cloud-only flow. A future official documented route must be rechecked and proven end-to-end without weakening enforcement before this blocker can be cleared.

**Current blocker: production App Check for Android cloud/judge access is UNVERIFIED and lacks an established supported no-Play-Console setup under the user's constraint.** No claim of universal impossibility; explicit provider documentation or Firebase support confirmation could resolve it. No production attestation was attempted on a phone.

Firebase supports custom App Check providers, but this requires secure server-side attestation verification/token minting and a threat-reviewed client/server integration, not client-shipped Admin credentials. It is NOT an implemented or authorized zero-resource escape hatch. Do not provision backend/resources or invent attestation. Do not disable AI Logic enforcement, allow unauthenticated cloud calls, embed/reuse debug tokens, use web Enterprise tokens as Android device proof or distribute a debug APK as judge-ready.

Official references:
- https://firebase.google.com/docs/app-check/android/play-integrity-provider
- https://firebase.google.com/docs/reference/appcheck/rest/v1/projects.apps.playIntegrityConfig
- https://firebase.google.com/docs/app-check/android/custom-provider
- https://firebase.google.com/docs/app-check/custom-provider

## Future GitHub Release checklist (PLAN ONLY)

1. First integrate complete app and safe UI/export with parent; pass build/unit/privacy tests and real physical-device acceptance. Preserve source SHA and reproducible artifact provenance. No release created in this lane.
2. Decide explicitly whether judge path is offline/manual-only or genuine production-attested hybrid. Label feature limitations plainly. Cloud/hybrid release remains blocked until normal signed sideloaded APK gets real production App Check and positive cloud response, plus missing/invalid-token negative controls under unchanged enforcement. Debug operator proof never clears this gate.
3. Prepare production-signed non-debug APK, stable applicationId, version/code, min SDK, signer certificate fingerprint and SHA256 manifest; protect signing material outside repo/artifacts/logs. Never commit tokens, keystore, service-account keys or debug-provider configuration. Verify release dependency/manifest excludes debug provider and exported test entrypoints. No signature/data-wipe workaround.
4. Prepare release notes and direct APK/checksum/source links for a GitHub Release ONLY after separate publication authorization. Explain Android sideload warning honestly; never ask to disable Play Protect. Judge device may lack Nano: show unavailable state and local/manual route, not claimed Nano success. Supported device still requires actual availability/download.
5. Supply short synthetic in-app walk-through, permission/minimal data policy, offline/local behavior, cloud approval boundary, known limitations, expected download time/storage and source/receipt references. No personal test data or credential access required. Assistant tests clean judge install/update path and records synthetic footage; Olly need not perform tests.
6. Verify judge download hash/signature and documented independent production access before calling release judge-ready. Actual release creation/upload, public links/posts, Store/submission and paid changes are all outside this authorization.

Current status: plan prepared; release NOT_CREATED; phone Nano NOT_RUN; production cloud attestation BLOCKED; offline/manual runtime NOT_RUN pending builder.
