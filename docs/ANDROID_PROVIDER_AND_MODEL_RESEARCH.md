# Android provider and model research — Council 3

Checked 2026-11-13 UTC against official live documentation; source baseline f9f38e2. Research only: no phone tests, enrollment, downloads, cloud changes, credentials, deployment or publication. This document owns no implementation. Existing android/docs/JUDGE_ACCESS_PLAN.md needs parent reconciliation with the new native provider evidence below.

## Decision summary

1. **The owner's native Android reCAPTCHA Enterprise suggestion is supported by current Firebase documentation.** It is not web-only: Firebase now documents a built-in **Preview** Android provider, Android-type reCAPTCHA key and native SDK. This supplies a documented no-Play-Console route; the older Play Integrity-specific setup blocker must not be generalized to every Android provider.
2. **Spark is explicitly supported**, with a no-cost assessment allowance, not unlimited free use. No billing upgrade or custom backend is required by the documented native provider setup. Actual project registration, native integration, non-debug token acceptance and Firebase AI Logic success remain **NOT_RUN / UNVERIFIED**. This research is not permission to change cloud configuration.
3. Pixel 9 Pro's current stable device-support table lists **Gemini Nano 3**. Firebase explicitly gives **Pixel 9 + PREVIEW → likely Nano 4 Full** as an example, subject to AICore Developer Preview enrollment, availability and download. This is a supported possibility, **not evidence the owner's phone already has Nano 4**. No enrollment is authorized here.
4. Android exposes an actual on-device name query; Chrome's public Prompt API does not establish a comparable exact model-version getter. Keep requested model/category, device-reported identity and inference route separate. Unknown stays unknown.

## Native Android App Check: supported alternative, remaining gate

The current App Check overview [A1] lists Android **Play Integrity | reCAPTCHA Enterprise**. The dedicated Android guide [A2] says “Using the reCAPTCHA Enterprise provider on Android is a feature that's in Preview”; it is not subject to an SLA/deprecation policy and can change incompatibly. The reCAPTCHA Mobile SDK has its own potentially faster deprecation schedule.

The documented setup is:

- Existing Firebase Android app in the same project.
- Google Cloud Fraud Defense/reCAPTCHA console: enable reCAPTCHA Enterprise API if prompted; create an **Android-type** key with the exact case-sensitive Android package name (here com.mizzen.safetosend). Each package name can correspond to only one reCAPTCHA key for App Check.
- Register the **Android app** in Firebase App Check with that key. This is distinct from the web app's Web-type/domain-bound key [A3]. Do not reuse a browser token or call web attestation Android device-integrity proof.
- Native dependency: `com.google.firebase:firebase-appcheck-recaptcha`. Guide minimum Firebase BoM **34.17.0+**; current example BoM **35.2.0**, standalone library **20.1.0**. Current Android release notes independently list that artifact/version [A4].
- Initialize Firebase and install `RecaptchaAppCheckProviderFactory.getInstance("SITE_KEY")` **before other Firebase service use**. The site key is a configuration identifier, not a replacement for genuine runtime attestation.

This is native app/risk assessment through the reCAPTCHA Mobile SDK. It is **not equivalent to Play Integrity hardware/device verdicts**. Describe the provider actually used; do not claim MEETS_DEVICE_INTEGRITY or tamper-proof hardware attestation from a successful reCAPTCHA result.

### Cost and security boundaries

[A2] explicitly describes no-cost **Spark**: available score levels 0.1, 0.3, 0.7, 0.9 and thresholds 0.1, 0.3, 0.5, 0.7, 0.9; recommends **0.5**. Linking billing only to obtain all 11 levels is optional and outside authorization. [A1] states **10,000 assessments/month no-cost**, cost above that; [A2] says one assessment per App Check refresh, normally twice per hour. This allowance is not a promised test budget or proof of remaining project quota. Never link billing, lower threshold to 0, relax existing enforcement or repeatedly force refresh to make a demo pass. Spark quota exhaustion behavior was not independently tested.

**Remaining factual blocker:** documented native provider exists, but this project has not been shown registered/configured for it, the builder has not been proven to include/use it, and no normal signed APK has obtained an accepted production token or cloud response. Parent should reconcile the plan, select this provider for future authorized implementation, then prove a non-debug positive cloud call plus missing/invalid-token negative controls with unchanged enforcement. Do not mark judge-ready until those receipts exist. Generic docs' suggestion to observe before enabling enforcement does **not** authorize disabling enforcement already enabled here.

Play Integrity remains a supported alternative whose Firebase-specific setup explicitly requires Play Console project linkage [A5]; outside-Play verdict settings do not remove that step. Custom App Check requires a secure server/Admin SDK token-minting service [A6], not an authorized zero-resource workaround. Debug provider remains private operator-only, never a judge bypass.

## Android Nano identity and Nano 4 preview

Current Firebase Android configuration docs [M1]:

- ONLY_ON_DEVICE throws if the device/model/request is unavailable; PREFER_ON_DEVICE can automatically send to cloud. SafeToSend raw input must stay ONLY_ON_DEVICE, with separately approved redacted cloud requests.
- Response inferenceSource reports ON_DEVICE or IN_CLOUD. That is a route, **not a model version**.
- generativeModel(modelName = CLOUD_MODEL_NAME) selects the cloud model. Do not display that value as the local Nano identity.
- OnDeviceModelOption.STABLE is default; PREVIEW and PREVIEW_FAST are release/performance **categories**, not immutable model IDs. AICore auto-selects a supported model. Current examples: nano-v3 / nano-v2 stable; nano-v4-full (Gemma 4 E4B) and nano-v4-fast (Gemma 4 E2B) preview. The docs explicitly say PREVIEW on Pixel 9 would **likely** select Nano 4 Full, not guarantee it.

Current device table [M2] lists Pixel 9, 9 Pro, 9 Pro XL and 9 Pro Fold under Nano 3; Pixel 10/11 families under Nano 4. It cautions that model/version varies with RAM, OS and AICore update status. Thus stable table and the separately enrolled preview example are compatible, not conflicting guarantees.

AICore Developer Preview [M3] is available for devices supporting custom generation/agents (including Pixel 9 Pro in [M2]). It requires joining the aicore-experimental Google group with the testing account, opting into the Android AICore testing program (affects supported devices with that account), updating to AICore Beta, and downloading a preview model. The Beta label can take up to an hour. **Do not enroll, change accounts, install updates or download under this research authorization.** Testing-program enrollment is not creating a paid Play developer/Console account, but it is still a separate account/device change requiring consent. No quota-bypass setting is proposed.

ML Kit model selection [M4] warns preview may point to the **same version as stable** during transitions, not every configuration is supported, and there is no API listing every available configuration. Check requested configuration status rather than infer support from a category. Keep public release on stable unless explicitly reviewed; preview can be a separately labeled internal experiment.

### Parent UI/evidence contract (not implemented here)

- Current Firebase reference exposes suspend **GenerativeModel.onDeviceExtension?.getModelName(): String** [M5], “Returns the name of the on-device model.” Query the same configured instance used for inference. Check nullable extension, availability and errors; retain returned string verbatim and its timestamp. Label “Device-reported on-device model”, not verified weight hash or independently attested model identity.
- ML Kit directly exposes **GenerativeModel.getBaseModelName()** [M2, M6], the base model used by that generator instance. Prefer Firebase's wrapper when staying within Firebase AI Logic; do not introduce a second inference stack solely to manufacture a version label.
- Firebase response **modelVersion: String?** exists [M7], but the reference does not establish that it always contains the local base model. Capture a non-null value as response metadata with route; never use a null field as permission to substitute a configured cloud name, category or guessed Nano generation.
- Suggested fields: platform, app/source SHA, SDK versions, requested inference mode, requested on-device category, availability, device-reported model name or UNKNOWN, response modelVersion or null, actual inferenceSource, model-query time, inference time, error. This baseline contains Android plans/scripts only, not the concurrent app builder source; no claim that these methods compile against its chosen dependencies. Parent/builder must compile-check pinned versions (current release table: firebase-ai 18.2.0 and firebase-ai-ondevice 16.0.0-beta08 [A4]).

## Chrome identity: do not map SDK alias to weights

Firebase web hybrid uses Chrome desktop Prompt API [W1]; Android AICore preview configuration does not configure Chrome. Current Chrome Prompt API docs [W2] identify Gemini Nano and expose availability/session/capability/sampling behavior, but do not document a public exact Nano generation/build identity getter. LanguageModel.params() describes sampling limits (and current docs scope it to extensions), **not model identity**. The upstream API explainer still treats exposing a model identifier separate from browser version as potential future functionality [W3].

Record Chrome version/channel, platform, actual availability and inference route; use **“Gemini Nano — exact version not exposed by API”** unless a genuine runtime diagnostic supplies a clearly attributed value. chrome://on-device-internals may provide operator diagnostic/component details; retain exactly what it says, do not translate component version numbers into Nano 3/4 without an official mapping. Model-generated self-identification is not evidence. Neither Firebase cloud modelName nor a local SDK alias is an actual downloaded model name. Android/Chrome observations must remain separate.

## Proposed operator sessions — plan only

These proposals do not override “build app fully first, then phone USB connection”; no request for Olly to execute setup/tests or recording. Assistant/operator owns adb and receipts on an authorized controllable Mac after connection. No phone operation occurred here.

### Early Pixel check — 10 minutes, after complete build

- 0–2: confirm exact tested APK/source/signature hash, authorized Pixel 9 Pro adb connection and synthetic-only screen; collect non-secret Android/AICore/app versions. No account enrollment, update, clearing data or device-security changes.
- 2–4: show requested STABLE + ONLY_ON_DEVICE, check model availability and actual name query; retain UNKNOWN/error rather than guess. If a download is needed, report/download only within separately granted device-download permission; do not burn the timebox waiting or switch to preview.
- 4–8: one synthetic text detection + local answer, then one synthetic gallery/image input if supported; collect raw outputs/schema/offset checks, cold/warm timings and no-cloud-boundary receipt. Test unavailable/manual route without sending raw data. Download/unavailable/error is a valid bounded blocker, not a fake success.
- 8–10: retain sanitized receipts, app/source/device model label and exact outcome; decide readiness for longer session. No cloud/debug/judge readiness inferred from local success. No Nano 4 claim from Pixel branding.

### Recording/evidence session — 45 minutes

- 0–5: freeze APK/source/hash, synthetic fixtures, clean capture framing and notices; confirm private remote control, model status/name and enough storage. No personal notifications/account screens in footage.
- 5–15: text plus image local inference; visible actual output, timings and real manual redaction correction (scroll into view, select, dwell, Add, show corrected span). Record failures honestly; no fixture substituted for Nano output.
- 15–25: only if native production provider configuration is already authorized and proven: normal non-debug App Check + approved-redacted cloud handoff, unchanged enforcement, exact sanitized outbound body/bytes/hash versus ledger, visible two-key approval, and token-missing/invalid negative control using safe operator harness. Otherwise explicitly record CLOUD BLOCKED and continue local/manual; do not spend time provisioning or use debug tokens to call it production.
- 25–35: rehearse and capture <=2:55 coherent synthetic local → reviewed correction → optional proven cloud → draft flow. Verify draft/explanation coverage and reconstructed roles. Model/version/source labels must match receipts; incomplete hybrid is not presented as complete.
- 35–45: decode/play back take; inspect key frames and privacy boundary, compute artifact hashes, retain sanitized evidence and limitations. Failed/partial take is NOT_RELEASE_FOOTAGE. No upload/release/publication authorized. Preview enrollment or model downloads are prerequisites for a separate session, not hidden inside these 45 minutes.

## Official references and fetch receipts

All successful URLs below were fetched through the read-only web tool on 2026-11-13; times are tool fetchedAt UTC (some cached within this investigation window). Quotes above are bounded excerpts, not a complete API/security guarantee.

- [A1] https://firebase.google.com/docs/app-check — 01:45:42.976, HTTP 200; native Android provider list and 10,000/month quota.
- [A2] https://firebase.google.com/docs/app-check/android/recaptcha-enterprise-provider — 01:45:56.267, HTTP 200; native Preview, Android key, Spark, dependency/init.
- [A3] https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider — 01:45:43.114, HTTP 200; Web key/domains, separate integration.
- [A4] https://firebase.google.com/support/release-notes/android — 01:46:55.523, HTTP 200; current SDK table and BoM.
- [A5] https://firebase.google.com/docs/app-check/android/play-integrity-provider — 01:35:07.526, HTTP 200; Play Console prerequisite and outside-Play verdict settings.
- [A6] https://firebase.google.com/docs/app-check/custom-provider — 01:46:55.804, HTTP 200; secure backend/Admin SDK required. Its opening generic provider list omits native Enterprise; prefer the dedicated current Android page and overview, not this stale introductory list.
- [M1] https://firebase.google.com/docs/ai-logic/hybrid/android/configuration-options — 01:37:09.450, HTTP 200; route/category/PREVIEW Pixel 9 example.
- [M2] https://developers.google.com/ml-kit/genai — 01:37:55.108, HTTP 200; device/generation table and getBaseModelName.
- [M3] https://developers.google.com/ml-kit/genai/aicore-dev-preview — 01:46:19.786, HTTP 200; supported devices, enrollment, Beta update/download.
- [M4] https://developers.google.com/ml-kit/genai/prompt/android/select-model — 01:46:30.161, HTTP 200; categories, availability, preview/stable caveat.
- [M5] https://firebase.google.com/docs/reference/kotlin/com/google/firebase/ai/OnDeviceExtension — 01:46:40.725, HTTP 200; getModelName; linked GenerativeModel reference fetched 01:46:20.062 confirms nullable onDeviceExtension.
- [M6] https://developers.google.com/android/reference/kotlin/com/google/mlkit/genai/prompt/GenerativeModel — 01:46:41.004, HTTP 200; getBaseModelName API.
- [M7] https://firebase.google.com/docs/reference/kotlin/com/google/firebase/ai/type/GenerateContentResponse — 01:46:20.106, HTTP 200; nullable modelVersion.
- [W1] https://firebase.google.com/docs/ai-logic/hybrid/web/get-started — 01:46:02.827, HTTP 200; Chrome desktop Prompt API integration.
- [W2] https://developer.chrome.com/docs/ai/prompt-api — 01:46:02.923, HTTP 200; public API and model diagnostics guidance.
- [W3] https://raw.githubusercontent.com/webmachinelearning/prompt-api/main/README.md — 01:46:30.480, HTTP 200; upstream model-identifier goal remains exploratory. This is the spec explainer, not a promise of Chrome implementation.

Unsuccessful exploratory paths (404) are not evidence of missing functionality: guessed Firebase /android/on-device and /hybrid/android/before-you-begin, incorrect /ai/type/OnDeviceConfig and /ai/type/OnDeviceModel reference paths, guessed firebase-android-sdk master source file. Successful canonical guide/reference URLs above supersede those guesses. No source-level implementation claim or exact downloaded weights was established.
