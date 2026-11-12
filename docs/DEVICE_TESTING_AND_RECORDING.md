# Operator-owned Nano testing and recording

Olly will not install or run anything locally. The assistant/operator owns setup, tests, and recording. No purchases, paid compute, billing linkage or Spark upgrade are authorized.

## Available-machine check — 12 November 2026

The accessible Ubuntu VM is ARM64, four CPU cores, 23 GiB RAM and about 40 GiB free profile-volume storage, with a Virtio display controller. A fresh **headed** system Chromium 156 on a private virtual display exposed LanguageModel but returned **unavailable** for both text-only and text+image sessions. Earlier bundled Chromium lacked the API. RAM/disk thresholds alone do not establish eligibility. We have not established the precise browser/platform rejection reason; do not label this as a successful Nano environment or assume flags/emulation fix it. The only paired external node is a disconnected Android device, not a supported desktop test host.

Safe headed capability evidence: [nano-headed-capability.json](evidence/nano-headed-capability.json).

## Machine needed (no new purchase)

An existing, authorized, remotely controllable desktop/session with current **Google Chrome**, preferably Windows 10/11 or Linux x86-64, or macOS 13+. At least 22 GB free on the Chrome profile volume (30+ GB preferred for model and recordings), unmetered internet, and either 16+ GB RAM plus four CPU cores, or strictly more than 4 GB GPU VRAM. Target a supported image-capable Prompt API, not just the presence of LanguageModel. A GPU is not automatically required for text/image CPU testing; audio is off scope.

Provide private remote desktop access plus permission for an isolated Chrome profile, initial model download, local test artifacts and screen recording. Do not paste passwords into public channels. No existing personal browser profile is needed. No paid VM allocation is authorized.

Reference: https://developer.chrome.com/docs/ai/get-started and https://developer.chrome.com/docs/ai/prompt-api (checked 12 November).

## Acceptance sequence on that machine

1. Record OS, CPU, memory, GPU/VRAM if used, free profile-volume disk, Chrome version, actual model identity/version when exposed, and image-capable availability. Only start download from a real button action when Chrome reports downloadable. Wait for ready; no mid-download cloud fallback.
2. Run the existing five-letter image + JSON-schema spike through **firebase/ai ONLY_ON_DEVICE**, not a substitute direct-Prompt-API implementation. Separate cold model initialization/download from warm inference timings. Retain output/schema failures and unsupported runs.
3. Expand the versioned synthetic evaluation corpus to at least 30 letters with ground-truth spans before claiming the full evaluation complete. Current corpus has five letters; do not fabricate a 30-letter result. Report Nano-only, regex-only and combined character-level precision/recall and per-letter timings, with failed/timeout denominator explicit. Preserve model outputs and record hardware/browser/model. Publish measured results and limitations in README; never promise perfect recall or legal compliance.
4. Keep arbitrary/Nano-derived cloud sends locked until the on-device journey passes. Any later release needs explicit source review, mandatory approval and independent no-leak checks.

## Recording plan (same controlled desktop)

Capture a clean isolated 1080p desktop using a local screen recorder (available FFmpeg on the VM; equivalent on the chosen host). No personal accounts, notifications, debug tokens, authentication headers or App Check request bodies in footage. Use supplied synthetic letters only. No mock or template result may be presented as Nano/cloud inference.

- 0:00–0:20: problem, synthetic label, device check.
- 0:20–1:00: actual local image inference, highlighted PII and mandatory review. Model download can be disclosed separately rather than concealed as instant setup.
- 1:00–1:40: approve redacted payload, real cloud explanation/actions/draft, restore locally.
- 1:40–2:30: DevTools Network request **Payload** tab beside privacy ledger. Show only approved placeholder text; compare exact HTTP request body, UTF-8 bytes and SHA-256. Run automated sentinel scan and negative CSP/approval controls separately. Ledger equals HTTP body, not encrypted TLS packet bytes.
- 2:30–2:55: real evaluation table, limitations and fail-closed unavailable-device behavior.

Final video must be no more than three minutes. Save original proof footage and a <=2:55 edit locally; Olly handles YouTube upload. Do not record a claimed end-to-end Nano demo before real device verification. Current deployed cloud/debug-App-Check/CDP proof is already real, but is explicitly synthetic-fixture-only and **not Nano**.

## Parallel App Check check

A fresh non-debug Enterprise attestation attempt stopped before navigation because sandbox-enabled Chromium could not launch in this environment. No inference requests occurred. No sandbox bypass, credential injection or infrastructure changes were made for that check. This does not diagnose Enterprise App Check as broken. The earlier real deployed private-debug App Check cloud/CDP proof remains valid. See [launch evidence](evidence/enterprise-attestation-launch-blocker.json).
