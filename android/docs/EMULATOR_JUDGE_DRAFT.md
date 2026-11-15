# Android judge/operator draft — PRIVATE HOLD

No public release or submission is authorized. Web remains primary; Android is experimental, not accuracy/parity validated.

## Distinct candidates

- Existing signed private release: source c441d02, receipt SIGNED_PRIVATE_CANDIDATE_2026-11-15.md. Uses normal native Enterprise provider. Production token acceptance, physical installation and Nano remain NOT_RUN. It is NOT the emulator demo APK.
- This branch's unsigned release: normal Enterprise provider unchanged, not signed or distributed. Public Firebase client metadata is configuration, not proof of attestation.
- Emulator recording: development debug provider, registered temporary private token injected into ephemeral emulator preferences at runtime, never compiled into APK. This is NOT normal release attestation. No debug APK, logcat, Gradle device reports or token-bearing files are uploaded by its dedicated workflow.

## Actual verified emulator cloud subset

[Run43737161647](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43737161647) at source3968e52 passed actual development App Check acquisition, strict parsed In Cloud acceptance, both exact-approved SDK ledger entries, missing-token rejection and clear-session. Approved input665 UTF-8 bytes, SHA256 `4d5271a0b2e68dacc6dc5eae2349b8b38fec77478dc459e64a186c94792e1b0b`. The 32.135s recording is continuously labelled PARTIAL; local Nano/two-key/semantic review remains unavailable, never full E2E. See [EMULATOR_RESULTS_2026-11-15.md](EMULATOR_RESULTS_2026-11-15.md) and committed sanitized receipts for proof and cleanup. Temporary enrollment and encrypted secret are deleted; no automatic live rerun.

## Operator-owned reproducible route

Requires existing free GitHub runner KVM (local ARM64 VM has no /dev/kvm and no emulator). Owner does not need to install or run anything. The dedicated emulator-cloud-demo workflow builds without secrets, scans release, then proves a public unregistered canary cannot enter any live log buffer before reading a temporarily registered encrypted GitHub secret in the emulator step. Supported ERROR thresholds are confined to that disposable emulator; the registered-token privacy tripwire remains mandatory and unfiltered. Registration and deletion are private operator actions; a deleted secret makes future cloud reruns intentionally unavailable until separately re-enrolled. Never lower enforcement, Enterprise threshold0.5/TTL3600, enable billing, or expose debug credentials.

## Visible flow and interpretation

1. Check actual Nano availability. Emulator must show UNAVAILABLE (or honest UNKNOWN if provider cannot determine it), not fake model identity.
2. Type synthetic Alex / Pay £20 by Friday. Select Alex and redact locally to [WRITER]. Confirm all content synthetic.
3. Preview exact application text, approve it once, run the manual approved-redacted hybrid request. Original and photos are ONLY_ON_DEVICE; no raw upload.
4. Only a parsed real SDK cloud response plus successful App Check token acquisition is cloud evidence. Failed provider requests remain failures. Exact approved string/hash/UTF-8 length must match both ledger entries. Ledger describes application SDK input, not HTTP/TLS packets; SDK wraps that text.
5. Private two-key review is unavailable on this emulator. Do not call it verified. TEST_ONLY wrong-deadline mutation is isolated from accepted answer and is NOT a Nano detection result.
6. Inspect in-memory ledger, clear session. No auto-send.

Recording labels must continuously state actual emulator, Nano unavailable, debug-development attestation and application-ledger-only provenance. Recording automation may drive real UI but must not substitute fixture responses. Separate NativeContractTest fixtures remain explicitly TEST_ONLY.

## Remaining judge-readiness gates

Normal release/native Enterprise attestation and actual Nano text/photo/semantic review need separately authorized supported hardware. No claim of full private local flow on emulator. No camera/gallery hardware proof, network packet inspection or native accuracy benchmark. Release, Play Console, public APK distribution and paid services remain prohibited.
