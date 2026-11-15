# Desktop local-answer diagnosis (in progress)

Canonical main checkout is untouched. Work is isolated on council/desktop-local-pass.

## Stage codes, not provider messages

Local-answer failures now expose an allowlisted stage, never provider error strings,
letter bytes, tokens or stack traces. SDK model creation, initialization, generation,
inference-source validation and response extraction are separate. Answer schema,
exact deadline evidence, verifier wire schema and final reply envelope are separate.
No failed/unchecked answer is rendered. Experimental unknown remains unknown, not
verified. Runtime inference still requires Firebase AI Logic ONLY_ON_DEVICE plus
response.inferenceSource ON_DEVICE. No cloud fallback exists.

The operator-only build installs an explicit memory observer before production
entry execution. It observes bounded actual synthetic response strings (100000 code
units), never invents replacements, and writes synthetic-local-responses.json mode
0600 into the isolated run artifact. Production main installs no observer and writes
no raw payloads. The workflow receives no credentials. Raw/failure captures are kept.

## Metadata is not a model alias

Official references inspected 2026-11-15:
- https://developer.chrome.com/docs/ai/debug-built-in-model documents Event Logs at
  chrome://on-device-internals.
- https://developer.chrome.com/docs/ai/get-started documents Broker State and runtime
  availability; browser-managed models may change independently.
- https://github.com/chromium/chromium/blob/main/chrome/browser/component_updater/optimization_guide_on_device_model_installer.cc
  (observed Git blob dd98ed01c495348a1e52e06f213418b6afc5b784) registers the legacy
  OptGuideOnDeviceModel asset, Optimization Guide On DeviceModels Manifest and
  generic Optimization Guide Manifest Component names/versions.

The recording retains chrome://components and on-device-internals metadata after
capture, separately from SDK/browser version. These component versions identify
installed packages, NOT a documented exact inference model identity. Actual Prompt
API model name/version remains UNKNOWN_NOT_EXPOSED. Stable is a browser channel.
Do not infer Gemini/Nano generation, parameter count or model alias from filenames.

## Runs

- 43748951219 source 66a4e2c: first diagnostic attempt. Its observer injection was
  discovered to occur after bundling (unserved /src import); preserve failure
  evidence, do not infer raw response absence means generation absence.
- 43749093128 source d623023: corrected observer bundled using pre HTML transform.
  Genuine native headed Chrome, same sandbox/free Ubuntu/Xvfb/ffmpeg route.

No external corpus evaluation dispatched. No deployment, paid resource, public
release, mobile/physical-device or normal cloud-attestation claim. Cloud not run by
this desktop diagnostic workflow.
