# Android demo/release preparation — November 15

This branch prepares APKs, not a published release. No GitHub Release, hosting deployment, Play Console, paid resources, phone enrollment or Mac installation is authorized here.

## Implemented demo

Photo selection/camera → ONLY_ON_DEVICE OCR → editable synthetic source → exact-quote local detection → manual range redaction (remove and reselect supported) → visible exact SDK application payload → one-use approval → actual provider response with SDK inferenceSource → original-bound local private review. Local explanation can run without a cloud handoff. Approval and accepted state invalidate on source/redaction/confirmation changes. Busy/liveness/revision protection is preserved.

Private verification now restores role tokens only inside the local verification request, while keeping the immutable accepted Answer/receipt identity for final validation. Whole-line verbatim support is conservative: paraphrases stay UNKNOWN. SDK source is not HTTP wire observation. PREFER_ON_DEVICE is not a guaranteed cloud call; only actual returned inferenceSource can establish the route.

TEST_ONLY planted wrong deadline is a separate object tied to the accepted receipt and source revision. It never replaces Accepted, writes a cloud ledger entry, or mints cloud provenance. Its local verifier request is real when a real provider is available. A literal absent-evidence warning is deterministic application evidence, NOT measured Nano semantic wrong-deadline detection. Model unavailable/error or semantic uncertainty remains UNKNOWN/unavailable. No physical Nano or accepted actual-cloud claim is made by emulator fixtures.

## Build/signing strategy

Existing free Native Android build workflow compiles SDK signatures, runs unit tests, assembles debug/release/test APKs, and runs API35 emulator instrumentation. It now scans the unsigned release ZIP and retains a source-SHA/version-named unsigned APK plus SHA256 manifest in the existing seven-day CI artifact. No signing key is created or published. Debug APK is never a public judge release.

Release version remains 0.1.0 / versionCode 1. Candidate filename: safe-to-send-0.1.0-FULL_SOURCE_SHA-unsigned.apk. Increment versionCode for later installable upgrades before signing. Source SHA identifies source, APK SHA256 identifies bytes, signing certificate SHA256 identifies signer; none substitutes for the others.

Before an installable release, parent/operator must use an approved private signing key stored in the secrets manager (never repo, artifact, logs or command-line password). With existing SDK build-tools, align unsigned APK using zipalign, sign using apksigner with protected password input/environment, then run apksigner verify --verbose --print-certs on the final APK. Record certificate SHA256 and final APK SHA256, package/version, source SHA and exact CI URL. Scan final signed APK again. Signing changes APK bytes: unsigned hash is not the final distribution hash. A key decision/configured native attestation remains a blocker, not permission to use a public debug key.

Scanner rejects debug-provider strings, debug-token marker, UUID-shaped enrollment tokens, private key PEM and GitHub credential markers without printing matches. It is a conservative marker guard, NOT a proof that every possible credential is absent; review APK contents, release dependencies and generated BuildConfig too. Public Firebase client config/site key may be present; debug enrollment tokens must not be.

## Mac handoff requirements (description only)

Only an authorized remotely controllable Mac with existing platform-tools adb and existing Android SDK build-tools aapt/apksigner/zipalign is needed for package/signature inspection and a separately authorized device session. No install was performed or requested here. aapt dump badging verifies package/version; apksigner verify --print-certs verifies signature. Need physical device authorization/unlock, compatible actual Nano runtime and private native App Check acceptance. Emulator App Check tokens do not prove physical production attestation. Never ask Olly to do setup/testing/recording personally.

## Judge script after parent authorization

Use synthetic notice: Alex / Pay £20 by Friday. Redact Alex, confirm synthetic, preview exact payload, inspect no Alex in preview, approve once, run once. Record actual source (ON_DEVICE vs cloud, never assume), response and application hash. Run private review; accept UNKNOWN honestly for paraphrase. Create TEST_ONLY planted deadline, inspect separate label/base answer unchanged, run local review and record observed output without calling the exact-evidence guard Nano accuracy. Source edit invalidates acceptance/approval. Clear session at end. Photo path additionally requires real OCR transcription comparison; camera/gallery privacy is not established by synthetic bitmap instrumentation.

Remaining release gates: native registration/config and production non-debug App Check owned by configuration worker; actual accepted cloud response; physical model identity from getModelName or UNKNOWN; physical text/photo accuracy and planted semantic behavior; final release signing/certificate attestation registration; exact transport observation if claimed; owner release approval. No paid/billing changes.
