# Actual Android emulator results — 2026-11-15

**PARTIAL / BLOCKED, not full cloud E2E success. No release.**

## Source and verification

Branch council/emulator-full-demo, based on 6edd07a. Actual builds cf809b0 and earlier are source-bound by their Actions runs. Latest cf809b0 run43732816968 compiled debug/release/instrumentation and passed unit-test build step plus release marker scan. Added two parser regression tests (38 total source unit tests versus prior36). Offline 12 source/recording guards,6 scanner fixtures,26 USB guards pass; no physical adb. Gitleaks nine-commit branch scan through cf809b0: zero findings. Normal release provider/configuration and shared canonical bytes unchanged.

Fixed real defects: SDK OnDeviceModelStatus default object string now mapped to explicit labels; malformed control-character Markdown fence literals in Prompts.parse replaced with real backticks, with regression tests. No claim/evidence normalization or relaxed validation.

## Actual cloud boundary reached

Runs [43730528349](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43730528349), [43731259129](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43731259129), [43731989397](https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43731989397) obtained an actual Firebase App Check SDK token using a temporary registered **debug-development provider**, not native Enterprise production attestation. Actual emulator Nano reported UNKNOWN / unavailable, device model UNKNOWN; no fabricated Nano inference.

Manual synthetic redaction UI approved [WRITER] / Pay £20 by Friday. Exact application input375 UTF-8 bytes, SHA256 8b893bf43ac8d6a8638e603701e2ab2c75fe4a4e5ec27214bd08110a99dc163c. Original Alex absent from input. Approval consumed, one ATTEMPT ledger entry. **No parsed Accepted Answer or successful second cloud ledger entry was proven.** Safe classification reported NONE in the provider wrapper, but this is insufficient to assert a successful cloud response; parser failure suspected and fixed, never retroactively called proof. No missing/invalid-token native negative control was completed.

Final cf809b0 run43732816968 stopped on runner privacy guard: SDK secret detected in private in-memory logcat despite attempted per-tag SUPPRESS. No raw logcat, APKs, test reports or token were exported; only labelled screen video. Therefore actual latest cloud receipt unavailable; do not infer acceptance from unit/build success. Future CI secret runs held until logging can be reliably prevented or private emulator used. Workflow now manual-only; safe receipt preservation improved but not rerun.

## Footage

- Run43731989397 artifact labelled-emulator-development-be37a2d498284ad51c9ce5aae185b02eb76f280e: **38.003s**,720px wide, continuous actual-emulator/debug-development/SDK-not-HTTP labels. Real UI manual selection, redaction, exact preview and request attempt. This is usable **partial-flow** footage, not successful cloud or full-flow verification.
- Run43731259129:32.747s but default320px emulator, labels clipped; superseded for presentation, retained as historical failure.
- Run43732816968:11.920s latest partial recording, not cloud success. No fabricated fixture response.

Private downloaded media/receipts: workspace .openclaw/tmp/safe-send-emulator-evidence-be37/ and -cf809/. Do not publish a full-flow claim. Judge/operator draft and release notes remain drafts.

## Cleanup verified 16:05:14 UTC

Temporary Android debug enrollment deleted; exact registration GET returned404. GitHub encrypted SAFE_SEND_EMULATOR_DEBUG_TOKEN deleted (secret list empty). SDK/app preferences and logcat cleared in runner finally; ephemeral runner discarded. App Check firebaseml.googleapis.com remains ENFORCED; Enterprise threshold0.5/TTL3600 unchanged; billingEnabled false. No billing/card/Play Console, physical devices, Mac, deploy or public release.

Remaining blockers: safe private emulator logging path; parsed actual cloud acceptance plus negative controls; supported Nano hardware for local text/photo, private two-key review, semantic wrong-deadline and full-flow recording. Owner need not run tests; operator owns future authorized hardware/session prerequisites.
