# Pixel 9 Pro: assistant-operated USB acceptance plan

**NOT_RUN — plan only.** No phone, adb, Mac installation, cloud configuration, publishing or recording is authorized now. Assistant/operator owns later execution on an authorized remotely controlled Mac; do not ask Olly to run tests. Web remains primary. Prior CI43352623202 at Android milestone333aff8 built debug/release, passed26 unit and4 TEST_ONLY emulator tests; it is not physical Nano or cloud evidence.

## Preconditions and hard stops

- Obtain separate authorization for the physical USB session and private remote control. Use existing platform-tools/build-tools only; missing tools = BLOCKED, no unsolicited installs. Never root/unlock bootloader, bypass Play Protect, expose adb TCP/IP, browse private photos/notifications or change paid resources/Spark/configuration.
- Select one physical USB serial privately. Helper rejects emulator/TCP/IP/unauthorized/offline/non-USB transport; this is not cryptographic integrity proof. Independently verify APK SHA256, package and intended signing certificate. Signature mismatch stops: no uninstall/data-wipe workaround. Debug APK remains private operator-only.
- Actual Firebase Android registration/client config and authorized native App Check remain prerequisites for cloud. Debug-provider proof and release native reCAPTCHA Enterprise Preview proof are different gates. Missing config/provider = BLOCKED cloud, never disable enforcement. Native Enterprise is not a Play Integrity hardware verdict. No negative-attestation harness exists in this UI.
- Canonical prompts/schema come from shared/nano/contract.json packaged at nano/contract.json, not the historical recovery receipt's hash. Run the offline drift suite below to print the current canonical SHA256; bind future APK inspection to that value and source SHA. Preserve android/RECOVERY_RECEIPT.md as historical evidence.

## Actual visible controls (MainActivity.kt)

These are literal existing labels, not invented selectors, exports, activities or intents. Scroll to each control and dwell so the action/result is visible.

- **Check Nano availability**: displays status, requested STABLE, device-reported model name or UNKNOWN and query timestamp. STABLE and cloud gemini-3.5-flash-lite are not Nano identity. responseModelVersion is retained separately in provider memory, not exposed/exported by this screen.
- **Download local model (explicit)**: tap starts download; transient status class names then a check-availability instruction. No dedicated cancellation control or durable progress history exists. Observe actual states only; do not clear AICore to manufacture states.
- **Choose photo**, **Camera**, then conditional **OCR photo — local only**: synthetic image only. Photo OCR is unstructured transcription using ONLY_ON_DEVICE, not shared imageSchema structured extraction. Review every character. No photo-preview control exists.
- **Original synthetic notice (select sensitive text)**: editable original. **Unique role: WRITER, ADDRESSEE, ADDRESS_1…** is a free-text role field; assign correct roles manually. Select text then **Redact selected range**. **Detect sensitive text — local only** shows suggestions, never auto-applies them. **Redacted notice** displays the result.
- **I confirm ALL content is synthetic, with no real personal data**: required for approval. Original changes clear spans and confirmation; adding a span or changing confirmation invalidates approval/accepted response. Editing the role entry alone does not change the existing map. No remove/resize-span controls exist: restart with the edited original and reselect, or clear and re-enter.
- **Preview exact hybrid payload**: read-only application-text preview. **Approve this exact payload** requires confirmation and at least one span. **Run approved hybrid response** consumes one approval before SDK suspension. No editable payload field, local-answer button or force-cloud switch exists. PREFER_ON_DEVICE may return local output; only an actual cloud source counts as cloud evidence.
- **Private two-key review — local only**: enabled after a parsed accepted hybrid response, not a planted mutation editor. Covers explanation, draft, deadlines, actions and amounts; conservative verbatim support or UNKNOWN, not a truth guarantee.
- **Privacy ledger — in-memory application bytes, not TLS packets**: visible text/UTF-8 bytes/SHA256/time/source. ATTEMPT is not successful inference. No ledger/response/modelinput export button exists. Clear/process death loses evidence.
- **Clear session** clears photo, original, spans, confirmation, approval, accepted response and ledger. Preserve authorized synthetic evidence first and wait until operations finish; no cancel-inference button exists.

## 10-minute early check — later authorization required

- **0–2 min:** private USB/APK preflight; note source SHA, APK hash, device/OS, clock and cold/warm context. Missing authorization/tool/signature stops.
- **2–4 min:** Check Nano availability; record status and model name or UNKNOWN. Unavailable/error means local inference UNAVAILABLE/ERROR, not success. Download only when separately allowed; do not pretend it fits the timebox.
- **4–8 min:** enter synthetic “Dear Alex, pay £20”; select Alex and set ADDRESSEE before Redact selected range. Verify only Alex becomes [ADDRESSEE]. Confirm synthetic, Preview exact hybrid payload, verify Alex absent. Before approval Run approved hybrid response must be disabled; approve and observe enablement. Edit original: approval must disappear, preview/accepted output reset and confirmation clear. Rebuild manual selection if continuing.
- **8–10 min:** capture sanitized visible evidence and unresolved gates. Do not dispatch cloud in this early check unless runtime config and authorization are independently satisfied. Record PASS/FAIL/NOT_RUN/UNAVAILABLE/ERROR per step. Stop at timebox; missing Nano is not a failed manual-redaction test.

## 45-minute acceptance / private recording session — later authorization required

- **0–5 min:** preflight and capability/identity evidence as above. Freeze 3–5 existing synthetic corpus IDs and source/image hashes; evaluator groundtruth stays outside prompts. No actual evaluation is claimed by preparing this plan.
- **5–15 min:** Choose photo or Camera using a synthetic notice; OCR photo — local only; compare transcription manually. Detect sensitive text — local only; preserve suggestions separately from manual selections. If local inference unavailable/error stop that route, retain manual path. Record observed latency, schema/error and model identity; no missing output replaced by fixtures.
- **15–25 min:** manual redaction with correct unique roles; review every sensitive value and preserve deadline/amount facts needed as evidence. Confirm synthetic, preview and approve. Demonstrate original/span/confirmation invalidation with actual controls, rebuilding selections as needed. Unsupported remove/resize/payload-edit interactions are BLOCKED UI coverage, not invented steps.
- **25–35 min:** only with authorized configured native App Check, rebuild review/approval then Run approved hybrid response once. Read actual source and visible ledger. Approval must be consumed; no auto-retry. A parse error or ATTEMPT-only ledger is ERROR, not accepted cloud output. If parsed answer exists, run Private two-key review — local only. Capture whole explanation/draft and conservative result; no planted wrong-deadline UI exists. Mutation/negative-verifier tests remain source/unit-only, not a phone demo.
- **35–45 min:** capture sanitized visible application ledger before clearing; independently transcribe/check UTF-8 bytes/hash only if exact text can be recovered. No export exists, so exact recovery may be BLOCKED. Record private clips only after privacy-safe synthetic screen setup: helper record is capped175s per clip, not a continuous45-minute recording. Verify pulled clip hashes, decode/inspect beginning/middle/end and every sensitive transition before exact-path cleanup; quarantine any personal/secret content. No publishing.

## Evidence boundary and remaining blocked gates

**BLOCKED — HTTP transport proof.** Implemented ledger records exact application text supplied to the Firebase SDK, not serialized HTTP request bodies/TLS bytes. There is no transport observer or export interface. Do not claim packet parity, complete wire-body hash or absence of sentinels from all outbound bodies from this ledger alone. Do not collect tokens, headers, HAR or full logcat. An independently authorized safe transport-observation mechanism would be needed; it is not implemented here.

Android semantics differ from web typed actions: Android arrays contain text/evidence claims; the conservative verifier supports only entire claims identical to complete original source lines with exact evidence. Paraphrases, mismatch and unsupported verdicts remain UNKNOWN. Shared quote fields/prompts do NOT establish semantic or accuracy parity, typed-action comparison, automatic role inference or a guaranteed wrong-deadline warning. No device accuracy numbers until independent groundtruth scoring of actual attempts; include unavailable/error attempts and report denominators.

Remaining gates: private native registration/client config; authorized debug App Check enrollment and separate non-debug Enterprise Preview acceptance; actual cloud source/response; physical Pixel Nano identity/schema/text/photo; camera/gallery privacy behavior; negative-attestation harness; HTTP transport proof; exports; planted-mutation recording UI. Unimplemented interfaces = BLOCKED, not simulated success. No release/judge distribution authorization implied.

For each later attempt retain: source/APK/canonical asset hash, input ID/hash, timestamps, device/OS, actual status/model or UNKNOWN, route/source, response/schema/error, reviewed manual changes, approval invalidation observations, two-key coverage/result, visible ledger evidence and private clip hashes. Keep original screenshots/notes distinct from derived transcription; do not imply a machine export exists.

## Offline readiness checks (no device operations)

From repository root:

    node --test android/scripts/readiness-contract.test.mjs
    bash android/scripts/test-pixel-usb.sh

The latter uses TEST_ONLY and a tripwire adb shim; it must report ZERO adb/device operations. Never invoke the actual helper for this readiness task. Availability/evaluate helper commands intentionally report UNAVAILABLE. Future authorized install/record/pull/cleanup use only the helper's existing documented interface; no invented activities, broadcasts, services, test intents or export commands.
