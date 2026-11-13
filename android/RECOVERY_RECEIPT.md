# Android recovery receipt — 2026-11-13

Original branch preserved from dbaaef6; parent main not edited. No cloud configuration, credentials, phone operation, deployment, public release or spend.

- Original run43347704102: debug/release SDK build +14 unit tests passed; emulator boot/input failed before instrumentation. KVM denied -> software boot623.6s -> adb broken pipe224. Recovery requires KVM on ephemeral runner.
- Source adds native Enterprise Preview release provider20.1.0, requires Android site key before cloud dispatch. Spark/no-Play-Console is documented support, NOT a configured or proven production token. Cloud remains BLOCKED pending owner-authorized native registration/configuration.
- Shared quotes-v1 asset SHA256 98c00ef2352bef621ea8018434191981b39899288907c97cc13e4cddb800517f matches main exactly. Structured native output requires KSP @Generable types; source now supplies generated-schema pipeline rather than cloud-only manual JsonSchema. Runtime Nano/schema result remains NOT_RUN.
- ONLY_ON_DEVICE/source checks for raw operations. Model identity queried from actual configured instance, absent -> UNKNOWN; requested STABLE never relabelled as Nano3/4. response.modelVersion separate nullable metadata.
- JVM source tests: Kotlin compiler2.4.0 + JUnit4.13.2, org.json20250517; 26/26 PASS (14 privacy,12 quote-contract). Recompiled QuoteContract.kt and both test sources against actual previously compiled same-branch Privacy/Prompts classes. No mock model results. This standalone run is NOT Gradle APK/emulator proof. Full Gradle local build blocked by host ARM64 lacking x86_64 AAPT loader; resource-skipping compile cannot substitute for full build.
- Conservative two-key supports only whole source-line verbatim claims and exact evidence. Paraphrases and model mismatch/unsupported remain UNKNOWN, not deterministic rejection. No semantic accuracy guarantee.

Final exact-source CI/APK/emulator receipts must be collected before declaring build-ready. Instrumentation includes explicit TEST_ONLY UI/manual approval and unavailable no-fallback contracts, never actual cloud/Nano. Physical camera/gallery and production App Check inference remain NOT_RUN.
