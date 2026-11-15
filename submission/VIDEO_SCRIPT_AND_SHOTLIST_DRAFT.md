# Three-minute demo — script and shot list draft

**Not a finished video. Target 180 seconds; rehearse and trim to actual capture.** Everything synthetic_only. New desktop task e0b5 and emulator task e946 are coordinator-supplied pending identifiers, not verified assets. Each new shot is **EXPECTED_NOT_CAPTURED**: no filename, duration, hash or inference result is invented. Parent must fill independently checked source SHA, asset path, SHA-256, actual duration and receipt. Cut an unproved shot or label it a plan, never stage success.

## Timed narration and shots

| Time | Narration draft | Shot / capture status |
|---|---|---|
| 0:00–0:18 | “An official letter can be stressful. Safe to Send explores a calmer way to understand it, without automatically uploading the original. This prototype supports made-up letters only.” | Desktop intro and synthetic fixture. EXPECTED_NOT_CAPTURED. |
| 0:18–0:42 | “Start with a synthetic letter. Personal-detail detection is experimental. Whether suggestions come from a local model or manual review, I inspect every redaction. The highlights are editable, not a promise that every detail was found.” | Legible review and one visible correction. EXPECTED_NOT_CAPTURED. Label manual vs genuine Nano accurately; never overlay simulated inference. |
| 0:42–1:07 | “Here is exactly what I am approving: the redacted payload. Changing the original or a redaction cancels approval. Nothing here authorizes sending the unredacted letter. Cloud explanation is a separate, explicit action.” | Exact payload, approval and actual invalidation. EXPECTED_NOT_CAPTURED. |
| 1:07–1:32 | “Cloud help uses approved redacted content. The ledger distinguishes application JSON from captured SDK HTTP-body bytes. A separate recorded cloud test matched 1,766 body bytes and a hash; known synthetic identifiers were absent from observed requests. That is scoped evidence, not universal privacy.” | Without verified new real-cloud footage, use existing dated ledger still as **separate cloud evidence**, not a live request. New shot EXPECTED_NOT_CAPTURED. No secrets. |
| 1:32–1:52 | “The result organizes the letter into an explanation, dates, next actions and an editable reply. Restoring personal placeholders happens locally. If this screen uses a deterministic local example, its label stays visible: it is not AI.” | Actual result/draft with true template/cloud label. EXPECTED_NOT_CAPTURED. Do not imply continuity from the separate cloud still. |
| 1:52–2:17 | “Here is the hybrid boundary: local original and review; only approved redacted content crosses to cloud. Separate genuine desktop tests exercised local inference. They do not prove a phone-to-cloud journey. Android and remote Pixel access still need authorized physical validation.” | Architecture, then independently verified desktop evidence or emulator capture. New shots EXPECTED_NOT_CAPTURED. Emulator caption: **EMULATOR — NOT PHYSICAL PIXEL / NANO NOT PROVEN**. |
| 2:17–2:43 | “Limitations matter. Across 32 synthetic notices, adapter character recall was 94.11 percent and precision 71.58 percent. Local checking decided only three of 128 trials; 125 stayed unknown. The one planted deadline rejection came from typed grounding, not a correct Nano verdict. This is not a reliable verifier.” | All32 score and 3/128 card, including one partial detector response caveat and report citation. EXPECTED_NOT_CAPTURED. Never crop denominators. |
| 2:43–3:00 | “I am Olly, a solo entrant using AI coding assistance. A November ninth preparatory spike is disclosed; substantial workflow and evidence work followed the stated start. Safe to Send is an experiment in inspectable control, not guaranteed privacy or legal advice.” | Source/provenance end card, synthetic-only warning, Apache-2.0. EXPECTED_NOT_CAPTURED. |

## Existing evidence — not new footage

- [Local product GIF receipt](../docs/evidence/product-preview.json): actual UI with deterministic templates, not AI.
- [Browser journey receipt](../docs/evidence/reviewed-journey-browser.json): UI behavior, not physical model proof.
- [Cloud body receipt](../docs/evidence/deployed-cloud-cdp-ledger.json) and [ledger still](../docs/evidence/deployed-cloud-ledger.png): separate 12 November synthetic test with private debug App Check, not normal production attestation.
- [Desktop Nano smoke](../docs/evidence/nano-native-smoke-result.json): real smoke inference, not finished video or phone footage.
- [Full evaluation](../docs/FIXED_VERDICT_EVALUATION_2026-11-15.md): all32 includes one partial detector response. 31-clean and 29-matched subsets must remain distinct. Unknown means unresolved, not safe.

## Editor acceptance gate

Keep corrections, payload text, true mode labels and unknown/warning states readable. Never splice output onto another run or imply separate receipts form one end-to-end execution. No real correspondence, account details, pairing codes, debug tokens or private addresses. Verify timing and narration length. If e0b5/e946 fails, preserve that fact and shorten rather than invent completion. Parent owns refreshing this draft with verified footage. Android release notes belong to the Android worker and are intentionally not duplicated. No upload, posting or submission authorized.
