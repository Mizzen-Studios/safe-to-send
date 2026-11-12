# Isolated cloud handoff — parent integration

Implementation complete; production release remains SOURCE-LOCKED (cloud-policy.ts false). No deployed app inference, real Enterprise attestation or DevTools parity claimed here. Parent real SDK harness is separate.

## Exact build interface

One environment variable: SAFE_TO_SEND_BROKER_CONFIG=/absolute/private/file.json.
Its JSON shape must be exactly:

    {"firebase":{"apiKey":"PUBLIC_FIREBASE_WEB_API_KEY","projectId":"safe-to-send-2026","appId":"1:794092402064:web:4e263548738bdb75a8af15"},"recaptchaEnterpriseSiteKey":"PUBLIC_ENTERPRISE_SITE_KEY"}

This is public web client metadata, NOT a Gemini API key. Build input stays outside git, preferably secrets-manager directory. Never put a debug token in this file, env var, source, URL, repository, storage, output logs or deployed assets. Parent can derive this minimal object privately from broker-config.json and recaptcha-enterprise.json; unknown keys are rejected by the build.

Run SAFE_TO_SEND_BROKER_CONFIG=/private/metadata.json npm run build. Outputs dist/index.html (raw) and dist-cloud/index.html (broker). Default/no metadata build remains fail closed.

Two Firebase Hosting targets in firebase.json: raw -> safe-to-send-2026, cloud -> safe-to-send-cloud-2026. Parent must bind these in .firebaserc before targeted deployment. Existing .firebaserc intentionally untouched by implementation owner. Only parent deploys/resources.

The release switch is src/cloud-policy.ts CLOUD_RELEASE_ENABLED, false by default. Parent source review must explicitly change this after server-enforced App Check, model free quota and boundary review are evidenced. Both bundles must then rebuild. It cannot be enabled by URL, storage or config. Do not enable while checking infrastructure alone.

On released UI: fixture journey -> mandatory review + exact payload approval -> separate Send this approved SYNTHETIC payload to cloud AI action. Local template action remains distinct. Fixture annotations are NOT Nano detection and cloud verification is not successful Nano evidence. Real-source path requires actual Nano detection. Parent injects any pre-registered explicit debug UUID only into a fresh private test browser broker realm before App Check initialization; no debug-token handling code is shipped.

## Trust boundary

Raw page keeps connect-src data:. It can frame only the exact broker HTTPS origin. No cloud endpoint is allowed on raw origin. No data in broker URL/referrer. Broker is sandboxed allow-scripts allow-same-origin, cross-origin from raw. Both ends check exact origin AND WindowProxy. Version, cryptographic 256-bit nonce, cryptographic 256-bit requestId and review revision bind one request/reply; broker consumes the iframe before async work. Source/redaction changes destroy the iframe and invalidate pending results. Broker has no source/image/mapping/restored reply. Only canonical immutable approved redacted JSON enters postMessage.

App Check initializes ReCaptchaEnterpriseProvider before getAI, requires a same-app nonempty token, then ONLY_IN_CLOUD generateContent runs with candidate gemini-3.5-flash-lite. Network enforcement/free quota are external controls, not established by client tests. SDK/provider errors never travel back verbatim.

## Ledger semantics

Application payload is not HTTP body. Temporary single-flight fetch hook exists ONLY in isolated broker and only observes the exact AI Logic generateContent POST endpoint, body string and UTF-8 bytes. It never inspects/returns headers or unrelated App Check/recaptcha requests. Audited SDK shape must contain just the exact approved text, responseMimeType, fixed responseSchema, empty default safetySettings. SDK shape drift fails before dispatch. Hook restored in finally. Wire entry is body, UTF-8 byte count, SHA-256, dispatch-attempt time and requested model. It is not tokens, response identity, transport compression/TLS bytes or network-success evidence.

Body is returned only with correlated reply; raw origin rechecks body schema, exact payload, UTF-8 bytes and digest before recording. Cancel/timeout may lose a body's report even after transmission. UI counts handoff attempts and captured bodies separately, never infers zero network from no capture. SHA/hash is integrity checking, not independent proof of remote receipt.

Parent must compare actual Network/CDP HTTP body bytes to ledger on deployed broker and check no raw sentinels in any requests, URLs or frames. Do not retain header dumps/HARs containing App Check credentials. Export only synthetic BODY comparisons and safe metadata. No DevTools proof claimed before that independent test.

## Verification at handoff

86 unit/contract tests, typecheck and dual build pass. DOM fixtures cover peer mismatch, nonce/revision/request mismatch, replay/reload, stale/cancelled digest, corrupt/absent wire, single flight and timeout. Actual SDK serialization uses mocked fetch (no inference). Isolated Chromium 145 verifies both HTTPS origins with production CSP, test-only in-memory source unlock and mock App Check/provider. Mocked parity is not deployed DevTools proof.

Parent evidence copied unchanged: cloud-infra-receipt.json (before real inference), real-cloud-sdk-private-harness.json (real inference, not app E2E; malformed output/invented placeholder retained), appcheck-negative-control.json (valid key/no token -> 401), nano-capability-nov12.json (absent/unavailable). Older no-key 403 is not correct App Check control. No key/token values retained.
