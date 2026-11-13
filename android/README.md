# Safe to Send — native Android experimental preview

Package com.mizzen.safetosend; Firebase project safe-to-send-2026. Synthetic-only. Web remains primary.

## Build
JDK 17, Android SDK platform 36/build-tools 36.0.0, Gradle 8.14.3, AGP 8.13.2, Kotlin 2.4.0. The official Gradle distribution and wrapper checksums are pinned. Run ./gradlew :app:assembleDebug :app:testDebugUnitTest :app:assembleDebugAndroidTest from this directory. Standard free public CI also compiles release attestation and runs API35 x86_64 emulator instrumentation.

APK: app/build/outputs/apk/debug/app-debug.apk. CI artifact safe-to-send-android-debug-<commit>. No release publishing or Play Console operation.

## Private runtime configuration
CI intentionally has no credentials and cloud fails closed. To configure an authorized operator runtime, create ignored android/private.properties outside Git review with firebase.appId and firebase.apiKey for an already registered Android app in project safe-to-send-2026. These are Firebase client configuration values, NOT server credentials. No google-services.json or Google Services plugin is used. Never commit private properties or App Check tokens. Never disable existing enforcement. Debug installs use DebugAppCheckProviderFactory; release uses PlayIntegrityAppCheckProviderFactory. Production attestation remains UNVERIFIED: official registration may require prohibited Play Console setup. An actual emulator cloud test is BLOCKED pending private registered runtime App Check. Do not retain full logcat, tokens or request headers.

## Privacy contract
Raw text, image OCR, sensitive-text suggestions and private two-key checks use ONLY_ON_DEVICE with no cloud fallback. Check and download Nano explicitly. Emulator Nano is unavailable; status exceptions mean UNKNOWN/unavailable, never supported. Missing Nano does not trigger cloud or template answers.

The independent hybrid request uses PREFER_ON_DEVICE and may fall back only after manual redaction, explicit synthetic confirmation, preview and exact payload approval. Nothing auto-sends. Source, spans and confirmation edits invalidate approval and accepted answers; dispatch consumes approval once before suspension. Only the approved redacted request string is handed to Firebase. A ledger records the exact UTF-8 application text supplied to the SDK, bytes/hash/time and SDK inference source. It does NOT claim to capture serialized HTTP or TLS bytes. Attempt records are not successful cloud proof.

Two-key checks cover every explanation, draft, deadline, action and amount claim with strict exact original evidence, current revision, accepted response identity and a fresh opaque response receipt. Empty/missing/invented evidence fails. Model-generated wording is not a truth guarantee. Writer/addressee and other unique role placeholders are restored locally only after the private check passes. Avoid redacting deadline/amount facts that the response must quote: if exact source evidence is not preserved the check fails closed.

Originals, responses, approvals and ledger are process-memory only, no SavedState, databases, analytics or content logging; backup disabled. Photo Picker opens input and decodes to memory without persistent permission. Camera requires Android's external camera contract and a narrowly scoped private FileProvider cache file: this is the unavoidable temporary camera handoff, deleted after callback and on startup. It is not a persistent original store. Process death clears text/bitmap session. No raw data is sent for crash/debug logging.

## Test honesty
Unit tests prove state and evidence invariants. Instrumentation injects explicitly labelled TEST_ONLY providers for UI/manual/hybrid contract tests; these are NOT actual Firebase or Nano inference. CI emulator is UI/contract proof only. Physical camera/gallery and actual phone Nano checks remain NOT_RUN. No real phone testing is authorized now.

Official API docs consulted Nov13 2026: https://firebase.google.com/docs/ai-logic/hybrid/android/get-started and https://firebase.google.com/docs/ai-logic/hybrid/android/configuration-options . SDK pins firebase-ai18.2.0 / firebase-ai-ondevice16.0.0-beta08 / minAPI26; experimental API may change.
