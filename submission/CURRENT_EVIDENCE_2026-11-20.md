# Current submission evidence — 20 November 2026

Draft only, not submitted or released. Product baseline `440ec1e`; this pass changes no runtime code, deployment, cloud configuration, billing or device state. No literal TBD slots were found; stale and contradictory slots are resolved below with measured evidence or explicit pending gates.

## Measured evidence

- [Real desktop local run](../docs/submission/DESKTOP_LOCAL_DIAGNOSIS.md), source `04ad3bf`: ONLY_ON_DEVICE detection, review, redaction and local answer execution completed. Raw media is 135.666667 seconds; receipt wall duration 137.802 seconds. Checks **UNKNOWN**, exact-quote downgrade and poor reply direction remain; human rewrite required. Earlier 45.53-second failed-closed take is history, not the latest execution outcome.
- Chrome `157.0.8103.78`, Firebase SDK `13.2.0`, component `nano_v3_cpu_component 2025.8.21.1028`, separate manifest `1.20261018.2`: these are separately observed metadata. Actual Prompt API model identity **UNKNOWN_NOT_EXPOSED**.
- [Final evaluation](../docs/FINAL_WEB_VERDICT_2026-11-15.md): detector all32 synthetic production-adapter character recall **90.02%**, precision **69.58%**; not a real-correspondence privacy guarantee. Verifier **14/128 planned**, **14/72 attempted** decided; **57 unknown, 1 aborted, 56 not run**. Target failed. Experimental warning-or-unknown only; do not use this as a successful verifier headline.
- [Accepted emulator cloud clip](../docs/evidence/emulator-2026-11-15/accepted-cloud-labelled.mp4): manual redaction, approved payload, accepted cloud response; DEVELOPMENT App Check, Nano unavailable, no physical phone.
- [Separate desktop cloud receipt](../docs/submission/DESKTOP_CLOUD_TAKE_2026-11-15.md): historical accepted DEVELOPMENT App Check cloud proof, not production attestation. That private clip and the 155.73-second desktop-cloud cut are currently absent. A receipt/hash is not an available video.

## Current private handoff

Rechecked existing durable files, SHA256 and ffprobe on 20 November; neither file is in this repository or uploaded. See [recovery receipt](../docs/PRIVATE_RECOVERY_2026-11-18.md).

- Restored roughcut: workspace-relative `artifacts/private/safe-to-send-recovery/roughcut/safe-to-send-private-roughcut.mp4`; **149.800000 seconds**, 1920×1080, video-only, 2,352,195 bytes. SHA256 `f7897d9c52490f716efb374b46d80c1bd7930582b6c823ee6162e4b931f03151`. Actual desktop local footage plus **separate emulator development-cloud** footage; edited waits disclosed, not continuous real time or continuous hybrid proof. Pixel cards are not phone footage.
- Signed private APK: workspace-relative `artifacts/private/safe-to-send-recovery/safe-to-send-440ec1e-private-signed.apk`; 13,568,608 bytes. SHA256 `106b8d58e9aa2cd31dd08da7ad562f44102dfcd691b36ed4d93cc082971ba5c3`. Source `440ec1e`; file/hash rechecked, not installed or tested on a phone in this pass. Earlier signing verification remains a historical receipt, not repeated here.

## Explicit pending gates — not complete

- Physical Pixel connection/pairing: **NOT_RUN by this draft worker**; parent owns current attempt. No inferred connection success or failure.
- Physical Pixel on-device text inference and photo behaviour: **NOT_RUN**; requires actual authorized device receipts.
- Normal production App Check token plus enforced cloud acceptance on the physical candidate: **NOT_RUN**. Development receipts do not substitute.
- Genuine physical local-to-cloud journey, planted-error review and captured phone footage: **NOT_RUN / NOT_CAPTURED**.
- Finished narrated edit/rehearsal and owner approval: **NOT_CAPTURED / PENDING**. Current silent roughcut is not a finished film.
- Public video URL, Devpost entry and submission: **NOT_PUBLISHED / NOT_SUBMITTED**; no publication authorized. Owner rules/eligibility review remains required.

Phone acceptance cannot repair weak verifier coverage or poor desktop reply quality. Preserve unknowns and failures even if device gates later pass.
