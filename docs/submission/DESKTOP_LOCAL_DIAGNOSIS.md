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

## Observed final result (19:12 UTC)

**Fresh real local flow completed, NOT a reliable/verified answer.**
Run https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43750733786,
source 04ad3bf (full source SHA in its summary), status RECORDED_REAL_LOCAL_PRODUCT,
zero errors and zero page external attempts. Raw unchanged silent X11 video:
[137.8-second take](../evidence/desktop-local-diagnosis-2026-11-15/success/take-raw.mp4).
SHA256 a11ac12897ee94b57bc452e90e7f5487e71f76381b12b519c07808bfa4569e0e;
1,314,845 bytes. Entire decode passed; actual 22s/130s frames inspected.

Actual local answer and four one-claim verifier responses were captured, not
fixtures. Unknown remains unknown. The explanation's quote altered a space into a
newline; exact evidence handling downgraded it. The draft asks the sender to correct
“your tax return”, a poor reply direction. It was NOT repaired, replaced or presented
as reliable. User must edit/check it. This is execution success, NOT semantic success.

First diagnostic run 43748951219 reached ANSWER_REPLY_ENVELOPE; raw output was
unavailable because that operator observer was misbundled. Its cause must not be
claimed as fully proven. A real prompt defect was found independently: cloud-only
placeholder-signature instructions were sent with the private original. Local
prompt now uses the literal Your name, keeps strict final role validation, and
removes contradictory placeholder envelope text. The nullable date schema uses
explicit anyOf string/null. We cannot isolate which of these changes caused final
success; repeated free-runner generation is variable.

43749093128 timed out before answer output (135s), 43749841914 failed MODEL_GENERATE,
43750343216 failed MODEL_GENERATE with native UnknownError. Those raw clips and
synthetic stage/response archives remain in private workspace desktop-run-RUNID;
all hashes retained in committed summaries. No exceptions or failed answer were
promoted to verified. Final SDK operation completed answer + all four check calls.

Observed separate Chrome metadata: Chrome 157.0.8103.78; Firebase SDK 13.2.0;
Optimization Guide On DeviceModels Manifest 1.20261018.2;
Optimization Guide Manifest Component: nano_v3_cpu_component 2025.8.21.1028.
Broker labels nano_v3_cpu_model CPU, 4074.77 MiB; these are literal diagnostic
package/backend labels, not an asserted inference model name. Actual SDK model
identity remains UNKNOWN_NOT_EXPOSED.

Cloud remains NOT_RUN in this take. The accepted emulator cloud clip already in
DESKTOP_FOOTAGE/EMULATOR evidence is separate; NEVER imply continuity or normal
production attestation. No debug token was used by these local workflows, and none
was sent to public CI/APKs/logs/receipts. A new desktop cloud recording is not claimed.
