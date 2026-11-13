# Android lane F: operator handoff (13 November 2026)

Status: **PREPARATION ONLY / PHONE NOT_RUN**. Built app, Pixel USB connection to an authorized remotely controllable Mac, implemented UI/export, and independent runtime verification are prerequisites. Assistant/operator owns setup, tests and recording; Olly is not being assigned tests. Build the complete app first. Package is `com.mizzen.safetosend`; builder owns app/Gradle/CI. This lane owns only android/docs, android/scripts and this file. No web changes.

- [USB operation and test acceptance](../android/docs/PIXEL_USB_TEST_PLAN.md)
- [Production judge access and attestation investigation](../android/docs/JUDGE_ACCESS_PLAN.md)
- Helper: `bash android/scripts/pixel-usb.sh --serial USB_SERIAL doctor` (run only later, on authorized Mac).
- Offline test suite: `bash android/scripts/test-pixel-usb.sh`. It uses TEST_ONLY and a tripwire stub, never a device.

Parent must reconcile actual app controls/export fields with builder after integration. No selectors, launch intents or evaluation adb API are assumed. Helper availability/evaluate deliberately return UNAVAILABLE outside argument-only TEST_ONLY mode. No real-phone Nano, cloud attestation, accuracy, latency, footage or judge-ready release is claimed.

## Official sources checked 13 November 2026

- https://firebase.google.com/docs/ai-logic/hybrid/android/get-started
- https://firebase.google.com/docs/ai-logic/hybrid/android/configuration-options
- https://firebase.google.com/docs/ai-logic/hybrid/android/generate-structured-output
- https://developers.google.com/ml-kit/genai#prompt-device
- https://firebase.google.com/docs/app-check/android/play-integrity-provider
- https://firebase.google.com/docs/reference/appcheck/rest/v1/projects.apps.playIntegrityConfig
- https://firebase.google.com/docs/app-check/android/custom-provider

Current Android hybrid is experimental; ML Kit Prompt API beta. Official guide lists firebase-ai 18.2.0 and firebase-ai-ondevice 16.0.0-beta08, minimum Android API26 for on-device, on-device dependency outside BoM. Version selection/build proof belongs to builder. Guide's lower support floor (AI17.10+/BoM34.10+) is not a lockfile recommendation. Android uses ML Kit/AICore, not Chrome Prompt API. Pixel9Pro is listed but device configuration, OS/AICore and actual checkStatus determine availability; list membership is not success.

FirebaseAIOnDevice.checkStatus() reports UNAVAILABLE/DOWNLOADABLE/DOWNLOADING/AVAILABLE; explicit download flow reports started/progress/completed/failed. Android inference does not auto-download missing model. AICore owns model updates; retain exposed version or UNKNOWN. Test through implemented app buttons/export only, not invented shell commands. Official example PREFER_ON_DEVICE auto-falls back: NEVER pass originals/photos to it. Raw processing must use ONLY_ON_DEVICE or manual local path; hybrid preference is permissible only over approved immutable redacted content.
