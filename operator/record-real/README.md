# Operator genuine local product take — NOT YET RECORDED

Prepared from 291947e. No dispatch, push, deployment or paid runner is performed
by preparation. Parent reviews and integrates this isolated branch before dispatch.
Existing native smoke receipt: docs/evidence/nano-native-smoke-result.json
(run 43337348269, Ubuntu Stable 157.0.8103.78 real 3/3 smoke).
Corpus run 43339470805 is separate; this work neither modifies nor evaluates it.

## Recipe after review

Use the manual **Operator genuine local product recording** workflow on the
reviewed commit in the public repository, standard free ubuntu-latest only.
Single concurrency group, max-parallel 1, 30-minute job. No secrets supplied.
Dependencies use npm ci; Playwright is an attach-only CDP driver. The existing
signed native Chrome installer and launcher are reused unchanged. Optional apt
installation is only free distro ffmpeg/Xvfb/xauth/x11-utils; no paid services.

Equivalent approved runner command after workflow setup:

    xvfb-run -a -s '-screen 0 1280x1024x24' node operator/record-real/run.mjs

Do not run on this ARM host or substitute a no-sandbox Chromium launch.
Canonical loopback port 5192 fails on conflict; isolated profile is never uploaded.
Fresh workflow runner/profile only; no profile cache or credentials.

## Real route and config

The operator build uses the real root index.html and unchanged src/main.ts,
src/nano.ts, src/hybrid.ts and production CSS. configFile:false/envDir:false
prevents loading any private env or normal broker configuration. It defines
ONLY inert public metadata needed for SDK object validation, not a Firebase
credential or registered cloud project. No broker build, config file, real
credential, debug App Check token, model stub or template response is injected.
createNano already uses ONLY_ON_DEVICE, no inCloudParams, and checks each response
inferenceSource. Existing raw Hosting CSP is served byte-for-byte. Page routing
blocks nonlocal requests; independent CDP metadata records page requests without
headers or bodies. Component/model downloads are browser traffic and explicitly
outside this page-egress claim. No DevTools UI/network panel is shown in this take.

Prepare UI activation/download gets a separate 15-minute prewarm, readiness
screenshot and timing. Live Xvfb ffmpeg screen capture then records real elapsed
time at 15 fps, maximum 175 seconds, no audio, montage, speedup or edits.
A concurrent live JPEG CDP screencast supplies an independent frame count/time.

Take sequence: synthetic sample original -> real Nano detection (product regex
union) -> highlights -> redacted preview -> both mandatory review checkboxes and
approval -> **Explain on this device** -> actual returned explanation/draft.
It never clicks sample annotations, template preview, cloud Send or two-key check.
The checkboxes demonstrate the product review gate, not a human certification of
complete anonymity. The operator must watch raw take and inspect all highlights
against the synthetic original before calling the footage suitable for release.
No perfect recall, full cloud/two-key journey, or legal accuracy claim is made.

## Evidence and rejection rules

Artifact real-local-product-RUNID retains take-raw.mp4, timestamped proof.json
(step starts/ends, prewarm, source commit, Chrome/effective flags, request origins,
errors, ffprobe metadata), prewarm-ready.png, seven step screenshots and manifest
SHA-256 hashes. No edits are performed; keep this raw bundle before any later
editorial cut. Failure preserves available partial evidence and exits nonzero.
Only RECORDED_REAL_LOCAL_PRODUCT plus zero errors/egress attempts, a decodable
<=175s video and operator visual review is usable. A failed take is NOT release
footage. FFmpeg early death, missing schema result or unsupported device cannot
be patched over with screenshots/templates. Download or inference over deadline
is a blocker, not permission to weaken eligibility/sandbox/privacy.

## Local verification (not inference)

    node --test operator/record-real/check-contract.mjs
    node node_modules/typescript/bin/tsc --noEmit
    node --input-type=module -e "import {buildProduct} from './operator/record-real/run.mjs'; await buildProduct();"

The TEST_ONLY fake in check-contract.mjs exercises selector order and assertions;
it is never imported by the runner or bundled product and proves NO model result.
Actual recording and inert-metadata SDK behavior on eligible native Chrome remain
pending dispatch. If SDK initialization unexpectedly requires registered metadata,
stop and report that exact validation error; do not read secrets or enable a cloud
fallback. No core production patch is currently needed: the operator-only build
can define the existing __DEVICE_CONFIG__ without changing production config.
