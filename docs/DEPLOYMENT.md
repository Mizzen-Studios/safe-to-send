# Hosting release preparation — NOT authorization to deploy

Source is ahead of the hosted fixture-era release. The no-publishing hold remains: obtain explicit owner approval for the exact clean candidate SHA and both existing Hosting sites before executing.

## One command, plan by default

Use Node 24.12+ from the reviewed repository root. Replace REVIEWED_FULL_SHA with the independently reviewed 40-character commit. Set SAFE_TO_SEND_BROKER_CONFIG to the existing private public-metadata JSON file path, never a debug-token file.

```sh
node scripts/deploy-hosting.mjs --source REVIEWED_FULL_SHA --config "$SAFE_TO_SEND_BROKER_CONFIG"
```

This validates and builds but **never invokes Firebase**. It installs the pinned lockfile with lifecycle scripts disabled, runs offline release contracts, unit/operator tests and typechecks, then builds both production origins using one snapshotted metadata input. Plan mode may access the npm registry; contract tests are offline. An ignored `.openclaw/tmp/release/candidate.json` records source SHA, Node version, config/metadata hashes and every artifact SHA-256/byte count, without metadata values or credentials. No separate lint script exists; production typechecking runs in `npm run build`.

Only after explicit future owner approval:

```sh
node scripts/deploy-hosting.mjs --source REVIEWED_FULL_SHA --config "$SAFE_TO_SEND_BROKER_CONFIG" --execute
```

This reruns all gates before invoking the existing authenticated Firebase CLI for project `safe-to-send-2026`, **only** `hosting:raw,hosting:cloud`. Both origins form one release cohort. Hosting updates are not atomic across sites: partial failure requires investigation, not automatic retry or rollback. No deployment is performed by adding these files or running offline tests.

## Configuration boundaries

- `.firebaserc`: raw → safe-to-send-2026; cloud → safe-to-send-cloud-2026.
- `firebase.json`: dist and dist-cloud respectively. Existing CSP/security headers and mappings remain unchanged.
- Vite still accepts only firebase (apiKey, projectId, appId) and recaptchaEnterpriseSiteKey. Release validation additionally checks the existing broker app identity and public-key formats; Vite retains the device app ID assignment. No debug token is accepted.
- Keep private inputs outside the repository in the secrets manager. The ignored snapshot contains only allowlisted public fields.
- Exact clean HEAD is mandatory before gates and before deploying. Do not silently derive the candidate SHA from current HEAD instead of reviewing it. No package/lockfile changes are needed.

## Remaining operator-owned release gates

1. Review source/live drift, privacy findings and exact SHA. Owner must explicitly lift the publishing hold. Preserve pre-start history, Apache-2.0 and prior MIT attribution. **Olly is the solo entrant**; Mizzen Studios organization presentation is flagged for owner review, not an additional entrant. Do not transfer the repository or change organization membership.
2. Run the four existing browser suites on the candidate: `scripts/verify-reviewed-journey.mjs`, `scripts/verify-cloud-handoff.mjs`, `tests/product-ui.browser.mjs`, `tests/hybrid-ui.browser.mjs`. Use an existing operator Playwright/browser installation and ignored `.openclaw/tmp` directory. These are templates/mocked-provider QA, not inference or attestation. Some write tracked evidence: review/commit any intended evidence separately, then plan the resulting clean SHA. This command does not install browsers or claim these suites ran.
3. Resolve supported-device full product-flow and non-debug Enterprise App Check evidence before calling hybrid behavior verified. Smoke inference is not corpus quality. Current published baseline: Nano recall/precision **0%/0%**, union recall **38.59%**, precision **41.90%**, mostly invalid verifier decisions. Source repairs do not prove improvement. Synthetic inputs only; no general accuracy/privacy guarantee.
4. Review candidate receipt/artifacts. After an authorized deployment independently fetch both live entry documents and referenced assets, compare bytes/SHA-256 with the receipt, record Hosting revision metadata if accessible, and run real-browser synthetic smoke with no unexpected requests/page errors or emitted analytics traffic. CLI success is not verification.
5. Historical private-debug cloud/CDP parity does not prove current production Enterprise attestation or successful Nano-to-cloud-to-two-key behavior. Any separately authorized cloud smoke must retain exact approved-body/ledger boundaries. Never publish credentials, headers or HAR files.

Existing workflows are manually triggered operator diagnostics/recording, not a deployment pipeline. This preparation does not dispatch workflows, provision resources, change billing/rules/DNS, publish releases, submit/post or contact organizers.