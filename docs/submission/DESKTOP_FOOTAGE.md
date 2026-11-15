# Actual desktop recording — 15 November 2026

**Real text detection worked; local explanation failed closed. This is failure evidence, not a complete success demo.**

- [Raw silent screen recording, 45.53 seconds](../evidence/desktop-2026-11-15/take-raw.mp4) (476,361 bytes). Live ffmpeg X11 capture on free public GitHub standard Ubuntu, actual headed Chrome 157.0.8103.78, native sandbox; no slideshow, montage, speedup, stubs or edited output. Black desktop strip remains below Chrome window.
- [Detection frame from the actual video, 22s](../evidence/desktop-2026-11-15/video-frame-22s.png): real SDK detection plus product regex union highlighted the five known synthetic private values. Deadline remains visible. This does not separate model-only contribution or measure general recall.
- [Failure frame from actual video, 44s](../evidence/desktop-2026-11-15/video-frame-44s.png): “Local answer unavailable or invalid; no fallback.” No explanation/draft was rendered. Production catches the underlying error, so this clip does not identify which generation/schema/verification stage failed.
- [Detailed receipt](../evidence/desktop-2026-11-15/receipt.json), [native proof](../evidence/desktop-2026-11-15/proof.json), [archive hashes](../evidence/desktop-2026-11-15/archive-manifest.json). Original runner manifest retained; omitted intermediate screenshots remain in the full downloaded workspace artifact.

## Provenance

[Run 43729661808](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43729661808), dispatched exactly once. Source **a383e70785d81a06b7fd821aa46e70839aa60fda**, production source unchanged from main 6edd07a. Requested **Stable** is a browser channel, NOT a model identity. Actual model identity **UNKNOWN_NOT_EXPOSED** by Chrome Prompt API. Firebase AI Logic SDK uses ONLY_ON_DEVICE and production detection rejects non-ON_DEVICE responses. No component filename is represented as a model version.

Video SHA-256: `b86cf4659d15e13ee73171023813472d21787a5e52e2d014ef6d148539371ede`. All downloaded manifest hashes checked; entire MP4 decoded without error. Video frames at 1, 22, 28 and 44 seconds visually inspected: readable real browser UI and expected live state changes. Prewarm/model download occurs before the take and is not hidden inside an edited clip.

Raw-page CSP is preserved, including connect-src none; four observed page requests were loopback only, zero external attempts. This is page-level route/CDP evidence, not a claim that Chrome model downloads make no network requests. Cloud send was never clicked. No real personal information, App Check, deployment, paid runner, Mac, phone, contact, submission or release was used.

## What this does not prove

Image detection was **NOT_RUN** here: the workspace explicitly does not support image uploads; its separate five-letter image research diagnostics were not represented as a product flow. Corpus evaluation belongs to the separate final-evaluation task; this recording did not dispatch it. Local answer did not succeed, and nothing was replaced with a template. Unknown checks are not verification.

The capture automation is tested separately: 6 contract tests and 254 scoped production tests pass, as do typecheck and operator build. Those tests are not inference evidence.
