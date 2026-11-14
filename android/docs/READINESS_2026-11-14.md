# Android readiness checkpoint — 2026-11-14

Base: main4b65b0f (latest integrated Android merge279a220). Isolated branch council/android-readiness. No runtime Kotlin, Gradle/workflow/config, canonical asset or historical receipt changes in this checkpoint.

## Completed

- Read MainActivity.kt, Ai.kt, Privacy.kt, QuoteContract.kt, QuoteTypes.kt, both native unit suites and NativeContractTest.kt against the integrated source, not a proposed UI.
- Rebound PIXEL_USB_TEST_PLAN.md to literal existing controls and explicit 10-minute/45-minute stop/evidence checklists. Removed assumed exports, payload editing, span removal/resizing, planted mutation UI and HTTP-body capture expectations. SDK application ledger is implemented; HTTP transport proof remains BLOCKED.
- Added dependency-free Node source-drift guards for shared asset packaging/no variant shadow copies, KSP/generated field shapes and list bounds, canonical prompt loading/status enums, actual queried model identity or UNKNOWN, ONLY_ON_DEVICE boundaries, one-use approval/provenance guards, conservative verification semantics, runbook labels and TEST_ONLY instrumentation labeling. Negative source mutations demonstrate field/bounds/annotation drift rejection. These are source assertions, not Kotlin execution or inference.
- Current asset identity is computed from canonical bytes by the test at each run. Do not copy the recovery receipt's historical hash into a current acceptance receipt. android/RECOVERY_RECEIPT.md stays immutable history. No APK from this checkpoint has been inspected.

## Verification

From repository root, no dependency installation:

    node --test android/scripts/readiness-contract.test.mjs
    bash android/scripts/test-pixel-usb.sh
    git diff --check

Results:8/8 Node tests PASS; bash syntax and26 offline guard cases PASS with ZERO adb/device operations; diff whitespace check PASS. First local Node iteration failed because the new test misspelled the Maven artifact coordinate; corrected the test to match the existing real dependency, without changing production config or weakening the guard. The guard runner uses a tripwire adb shim; actual helper/device operations were not invoked.

No new Android build/emulator CI dispatched: production Kotlin, Gradle, workflow and shared asset bytes are unchanged, so the smallest relevant verification is the new source suite and existing offline helper guards. Historical CI43352623202 at333aff8 remains historical debug/release +26 unit +4 TEST_ONLY emulator evidence, not validation of a physical Pixel, actual SDK cloud response or current-device model support.

## Source findings / deliberately not invented

- Instrumentation's manual UI test proves redacted SDK handoff, not acceptance/two-key: TestOnlyProvider returns non-JSON text, which production parsing rejects. No parsed accepted-answer/two-key UI success should be inferred from its passing assertion. Native unit tests cover conservative quote/verifier/provenance invariants; this checkpoint adds no fabricated inference result.
- UI has no remove/resize span, editable payload, explicit standalone local answer, cancellation, photo preview, transport observer, export, App Check negative-control or planted-mutation editor. These are explicit blocked/unsupported demo steps, not an excuse to add broad controls during readiness work.
- Original readiness finding (before the focused busy-guard follow-up below): Clear session was enabled while busy, allowing a photo to be recycled during suspended OCR. The original operator wait rule and historical validation limits are preserved; see the follow-up for the source correction and bounded regression coverage.
- A suggestion operation overwrites the visible result; there is no persistent suggestion/response history. Preserve synthetic observations at each step before further operations.
- Android text/evidence claim arrays and conservative whole-source-line support differ from web typed actions. Shared wire prompts/fields do not prove semantic/accuracy parity. No Nano accuracy, reliable planted-deadline warning or release-readiness claim.

Remaining gates: authorized native Firebase registration/client config; private debug App Check enrollment and separate non-debug native reCAPTCHA Enterprise Preview acceptance (not Play Integrity); actual accepted cloud inference; physical Pixel availability/model identity/schema/text/photo; camera/gallery privacy; exact HTTP transport proof; unsupported negative/recording/export interfaces. Spark/no paid resources/config changes/Mac installs/phone operations/publishing/organizer contact preserved. Parent owns review and integration.


## Focused busy-operation follow-up — council/android-busy-guard

Based on main fbd2212. No broad UI changes or provider/config changes.

- Clear session, original text, synthetic confirmation and role editing are disabled during an operation. All destructive UI callbacks recheck the live ViewModel busy flag, including queued semantics callbacks; task acquisition rejects overlap. Camera/gallery results are rejected before decoding when busy, closed or their launch revision is stale; an already decoded rejected bitmap is recycled without replacing the current photo.
- Every provider completion (OCR, detection, hybrid, private verification, availability and download updates) checks coroutine liveness, open session and captured revision before writing results. Cancellation is rethrown. Busy ownership lives in the ViewModel across recomposition/recreation; undispatched acquisition installs cleanup immediately. ViewModel clearing defers photo recycling until the active operation exits, rather than recycling provider-owned input while suspended.
- Three additional explicitly TEST_ONLY controlled-suspension emulator cases cover OCR bitmap retention and disabled controls/queued clear callback; stale OCR completion rejection; and redacted hybrid handoff with Clear locked until controlled completion. The hybrid response is deliberately non-JSON and rejected: these tests do NOT establish accepted-answer/two-key success, actual Firebase/cloud, Nano, camera hardware or physical lifecycle acceptance. The original four instrumentation cases remain unchanged in meaning.
- Two additional PrivacySession unit cases reject old accepted-answer revisions after clear/source replacement. Total declared unit cases:28 (prior26 +2); total instrumentation cases:7 (prior4 +3). Actual Gradle/emulator execution and conclusions must be taken from the Native Android build workflow run bound to this branch's exact commit, not inferred from these declared counts.
- Local verification:10/10 offline Node source guards (prior8 +2),26/26 offline USB helper guard cases with ZERO adb/device operations, and git diff --check PASS. Existing historical receipts are unchanged. Android build/emulator verification is requested through the existing free workflow; this document alone is not its execution receipt.

Resolved source risk: ordinary Clear/edit/photo replacement callbacks cannot recycle or mutate the operation's source while busy, and obsolete completions are rejected. Coverage remains bounded to synthetic TEST_ONLY emulator behavior and native unit/source contracts. No physical Pixel/Nano inference, accepted cloud result, HTTP transport observation, real capture/gallery, production App Check, accuracy or release-readiness claim. Remaining gates above are unchanged. No deploy/release/publishing, paid resource, Mac install, phone operation or cloud configuration change. Parent owns review/integration.


### Executed verification receipt

[Native Android build43566849756](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43566849756) completed SUCCESS for code/test commit4954ddb0584fa55e2dcc2389d7ebd398c8d7d9e9. Real SDK signature compilation, debug APK, release assembly and test APK assembly passed. Downloaded reports independently inspected: unit HTML28 tests,0 failures,0 ignored; API35 emulator XML7 tests,0 failures/errors/skips, including all three named controlled-suspension cases above. The prior26 unit +4 emulator baseline is therefore28 +7, not an accepted-answer or model-inference result. Offline Node10/10 and USB helper26/26 remain separate source/helper evidence.

Artifact14102977339 (7-day workflow retention), safe-to-send-android-debug-4954ddb0584fa55e2dcc2389d7ebd398c8d7d9e9, archive digest SHA256824ea174041942134ea8e0c2289555ba3863bf502c14bc4677b7ab6b701f3396; downloaded debug APK SHA2568246d2e894eed4b6bf74d89608c88ef530308d45d7cf3d2ad3b3e91280b146cd. Reports and APK inspected as build/test evidence only; no phone install or actual Nano/cloud invocation. The receipt-only follow-up changes no Kotlin/tests/config/assets; subsequent exact-head workflow status remains independently visible on this branch.
