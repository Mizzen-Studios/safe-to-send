# OPERATOR ONLY: local Nano corpus collector

**Real-device status: NOT_RUN. No accuracy, catch-rate or Nano latency measured.**
This is a separate local experiment, not a product feature, product UI, release
mode, cloud probe or CI job. Nothing is deployed. Do not copy its build to Hosting.
The existing five-fixture UI collector and product sources are unchanged.

## Operator-owned run (authorized supported desktop)

Use the repository's installed dependencies and Node >=24.12.0. No Firebase
project, credentials, environment file, App Check, paid plan or app config is needed.
This recipe belongs to the assistant/operator, not a request for Olly to run it.

1. Use a clean checkout containing this commit and an isolated current Chrome
   profile on the authorized desktop. Do not spoof eligibility or disable the
   browser sandbox. Permit browser-managed model download if eligible; ensure
   adequate disk/headroom first. Preserve a note of browser/OS/flags/hardware and
   any eligibility overrides separately; UA/platform are not independent attestation.
2. Ensure the canonical Safe to Send port 5192 is free (stop only an operator-owned
   preview by normal means). From the repository root:

   ```sh
   node operator/device-eval/run.mjs serve
   ```

   The build is in ignored `.openclaw/tmp/device-eval-dist`; the server binds
   **127.0.0.1:5192 only**, fails on conflict, and has no upload/result endpoint.
   Do not use Vite dev/preview, a general file server or a public tunnel: they
   would bypass this harness's serving/CSP contract. Open http://127.0.0.1:5192/.
3. Click **Initialize and collect locally** once, in a visible tab. Allow up to
   15 minutes for initial download/initialization; each subsequent adapter call
   has a 60-second wall-clock timeout. No retries or hidden warmups. Stay on the
   page; **Stop** aborts the active operation. Timeout/Stop halts all remaining
   trials as `not_run`. Save local JSON when finished, including failed runs.
   A missing API or pre-inference blocker also offers a NOT_RUN JSON export.
4. Check the receipt's initialization and all coverage groups **before** quoting
   any result. Required complete coverage is 32 detector successes, 96 decided
   mutations and 32 decided controls; unknown/error/timeout/aborted/not_run are
   separately reported. Review exact native inputs/schemas/raw responses/errors.
   Keep original receipt unchanged and private/local; it contains synthetic text
   and untrusted raw model output (do not render output as HTML).
5. For a real run with at least one successful detector row only:

   ```sh
   node scripts/evaluate.mjs import /absolute/local/path/safe-to-send-operator-device-eval.json
   ```

   This existing importer scores **successful subsets only**. Always accompany its
   output with the original receipt's planned denominators, unknowns and failures.
   It ignores extra receipt fields and cannot represent unknown trials. No-results
   and NOT_RUN/TEST_ONLY receipts must not be imported or relabelled. The importer
   calls the field `twoKeyModelCatchRate`, but this harness tests only the three
   authored corpus claim fields, **not** end-to-end product two-key coverage.
6. Stop the server with Ctrl-C and close the isolated tab/profile. Export is via
   a local Blob download; no browser-to-server result submission is implemented.

## What is actually exercised

- The unchanged `src/nano.ts createNano`, Firebase browser SDK 13.2.0,
  `ONLY_ON_DEVICE` detector/verifier methods, production PII/verifier schemas,
  `parseTextDetection` and `parseVerification`. Dummy Firebase app identifiers
  are intentionally nonfunctional for cloud. Production adapters reject any
  response not marked ON_DEVICE. There is no cloud fallback.
- 32 text detector operations, then 128 **independent** verifier operations:
  one authored control plus each of three single-field mutations per letter.
  Verifier order is fixed xorshift32/Fisher–Yates, seed `0x51a7e032`; it is
  reproducible, public and independent of secrets. No adaptive ordering/retries.
  The production SDK uses new single-turn sessions per generation; the wrapper
  additionally destroys all sessions after each outer operation.
- Native `LanguageModel` is transparently wrapped before SDK construction to
  record exact prompt messages, response schema, raw output (including invalid
  JSON), native status/errors and timings; it adds abort signals and tracks
  session cleanup. It does **not** supply model responses or change prompt/schema
  content. If the native API cannot be wrapped, fail NOT_RUN rather than bypass it.
  Abort/destroy are best-effort browser APIs; late-created sessions are destroyed,
  late output is discarded, and no later trial starts after a timeout.
- No corpus annotation, baseline expected claim, truth span, mutation label,
  source id, variant, order id or correctness label enters model inputs. Detector
  receives only letter text; verifier receives original plus the candidate's
  three claims under fixed opaque ids c0/c1/c2. Expected data remains available
  to **local scoring** only. Corpus candidate values are hypotheses, never an
  additional baseline answer shown beside the candidate.
- Claim projection: deadline becomes production deadline JSON with blank evidence
  and action (no expected evidence supplied); amount becomes a two-decimal GBP
  string, or the assertion "No monetary amount is stated" when null; action is
  the candidate action. This preserves the existing corpus's `amountPence`
  semantics, including its synthetic US caveat, not a currency-general benchmark.
- Production evidence parsing is reused. Any unknown submitted check makes the
  trial unknown, even alongside a mismatch. Otherwise mismatch/unsupported means
  rejected and all supported means accepted. This intentionally scores submitted
  checks, **not** the product aggregate: the full explanation/draft are absent,
  so the product's full-journey coverage would remain incomplete. Supported is
  model-supported evidence, never a deterministic truth guarantee. Date spelling
  and amount-evidence limitations of the production parser remain unchanged.

## Receipt and timing contract

The full JSON includes per-call status/start/timing/error, exact raw native output
and native calls; initialization is separate. A native subcall may remain pending
when its outer operation times out; the outer status is authoritative. Unavailable
calls have no invented output. Errors/unknowns never become boolean rejections.

`results` contains importer-shaped detector successes with exact original text,
spans and outer latency. `twoKeyDecisions` includes **only** accepted/rejected
trials and restores the private scoring labels after inference. Separate detector,
mutation/control and overall verifier coverage retains every missing denominator.

SHA-256 uses UTF-8. Corpus/schema hashes are of `JSON.stringify` values; each
prompt hash covers `JSON.stringify` of the exact native message array, and its
schema hash covers the exact responseConstraint. Source file byte hashes, lockfile
hash, build-time commit and tracked-dirty flag bind the adapter/collector version.
A commit, UA or successful schema response is **not** independent device attestation.
Model revision is not exposed/attested by the SDK and is explicitly labelled so.

Outer timings use performance.now and include SDK availability/session init,
generation and adapter/parsing work. Verifier per-call initialization remains part
of each call because the production method does that. Initial download timing is
separate, not a pure model-only cold-start metric. No latency from mocks is model
latency. Native subcall timings are also recorded, not silently substituted.

## Network boundary

The standalone build sets configFile:false, envDir:false and publicDir:false: no
product Vite config/private env input or public asset directory is loaded. The
loopback static server only serves built HTML and whitelisted JS/CSS filenames,
rejects uploads/foreign Host/source paths, and sends CSP default-src none,
connect-src none, script-src self, no forms/frames/workers/objects. The page has no
external HTTP route, telemetry, remote script, cloud broker or upload API. Browser
component/model downloads occur outside page CSP and remain permitted; CSP does
not attest the entire browser/OS network. Do not weaken connect-src for SDK errors.

## Focused verification (TEST_ONLY, not model evidence)

```sh
node --check operator/device-eval/run.mjs
node node_modules/typescript/bin/tsc -p operator/device-eval/tsconfig.json
node node_modules/vitest/vitest.mjs run --config operator/device-eval/vitest.config.ts --configLoader runner
node operator/device-eval/run.mjs build
```

Tests inject explicitly TEST_ONLY native/model stubs to check all 160 operations,
blinded actual production prompts, production schemas, malformed-output retention,
zero fetch calls, importer **row shape**, unknown/failure separation, timeout/init
failure, late-session destruction, and static serving restrictions/CSP. Browser
SDK is explicitly selected in test config: Firebase's Node SDK is cloud-only and
is not a substitute for a browser-native test. Mock receipts are never labelled
REAL_ON_DEVICE, never imported as real results and never committed as measurements.
The importer has not yet been run on real Nano results because none exist.

No eligible real model was available for this implementation. Real browser-native
SDK integration with dummy app identifiers, model download, image/OCR, complete
product journey, model accuracy/latency and recording all remain **NOT_RUN**.
