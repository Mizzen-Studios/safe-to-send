// Offline source guards, not Kotlin execution, APK inspection or model inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = p => readFileSync(root + p, 'utf8');
const kotlin = 'android/app/src/main/java/com/mizzen/safetosend/';
const ai = read(kotlin + 'Ai.kt'), ui = read(kotlin + 'MainActivity.kt');
const privacy = read(kotlin + 'Privacy.kt'), quote = read(kotlin + 'QuoteContract.kt');
const types = read(kotlin + 'QuoteTypes.kt');
const plan = read('android/docs/PIXEL_USB_TEST_PLAN.md');
const bytes = readFileSync(root + 'shared/nano/contract.json');
const contract = JSON.parse(bytes);
const fields = schema => Object.entries(schema.properties).map(([name, s]) => [name,
 s.type === 'array' ? 'List<' + ({ findings:'QuoteFinding', checks:'QuoteCheck', evidence:'QuoteEvidence' }[name]) + '>' : 'String']);
function assertType(source, name, schema) {
 const found = source.match(new RegExp('@Serializable @Generable data class ' + name + '\((.*?)\) \{ companion object \}', 's'));
 // @Guide contains a closing parenthesis, hence match through the companion marker.
 assert.ok(found, name + ' must be serializable/generable with a companion');
 const actual = [...found[1].matchAll(/val (\w+):([\w<>]+)/g)].map(m => [m[1],m[2]]);
 assert.deepEqual(actual, fields(schema), name + ' fields must mirror canonical schema');
 assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
 assert.equal(schema.additionalProperties, false);
 for (const [key, s] of Object.entries(schema.properties)) if(s.type === 'array') {
  assert.ok(found[1].includes('@Guide(maxItems=' + s.maxItems + ') val ' + key), name + ' list bound');
 }
}

test('canonical asset packaging uses shared bytes and prints current hash, not historical receipt pin', t => {
 const gradle = read('android/app/build.gradle.kts');
 assert.ok(gradle.includes('assets.srcDir(rootProject.file("../shared"))'));
 assert.ok(ai.includes('assets.open("nano/contract.json")'));
 for (const variant of readdirSync(root + 'android/app/src')) {
  assert.equal(existsSync(root + 'android/app/src/' + variant + '/assets/nano/contract.json'), false, 'no stale shadow copy in ' + variant);
 }
 assert.ok(gradle.includes('com.google.firebase:firebase-ai-ksp-processor:'));
 assert.ok(read('android/build.gradle.kts').includes('com.google.devtools.ksp'));
 t.diagnostic('canonical shared/nano/contract.json SHA256 ' + createHash('sha256').update(bytes).digest('hex'));
});

test('@Generable fields and list bounds track the canonical quote schemas', () => {
 assertType(types, 'QuoteDetection', contract.detectionSchema);
 assertType(types, 'QuoteFinding', contract.detectionSchema.properties.findings.items);
 assertType(types, 'QuoteReview', contract.verifierSchema);
 assertType(types, 'QuoteCheck', contract.verifierSchema.properties.checks.items);
 assertType(types, 'QuoteEvidence', contract.verifierSchema.properties.checks.items.properties.evidence.items);
 assert.deepEqual(contract.detectionSchema.properties.findings.items.properties.kind.enum, contract.piiKinds);
 assert.ok(ai.includes('QuoteDetection.firebaseAISchema()'));
 assert.ok(ai.includes('QuoteReview.firebaseAISchema()'));
});

test('field and bounds guard rejects representative source drift', () => {
 assert.throws(() => assertType(types.replace('val kind:String','val category:String'), 'QuoteFinding', contract.detectionSchema.properties.findings.items));
 assert.throws(() => assertType(types.replace('maxItems=10)', 'maxItems=9)'), 'QuoteCheck', contract.verifierSchema.properties.checks.items));
 assert.throws(() => assertType(types.replace('@Serializable @Generable data class QuoteReview','data class QuoteReview'), 'QuoteReview', contract.verifierSchema));
});

test('detection/verifier prompts and schemas load from the packaged canonical asset', () => {
 for (const key of ['detectionPrompt','verificationPrompt','detectionSchema','verifierSchema']) {
  assert.ok(ui.includes('contract.get' + (key.endsWith('Prompt') ? 'String' : 'JSONObject') + '("' + key + '")'));
 }
 assert.ok(ui.includes('SafeApplication.contract'));
 assert.ok(!ui.includes(contract.detectionPrompt));
 assert.ok(!ui.includes(contract.verificationPrompt));
 assert.ok(ui.includes('contract.getJSONArray("piiKinds")'));
 for(const kind of contract.piiKinds) assert.ok(kind.length > 0);
 const domains = contract.verifierSchema.properties.checks.items.properties.status.enum;
 const match = quote.match(/require\(status in setOf\(([^)]+)\)\)/);
 assert.deepEqual([...match[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]), domains);
 assert.ok(quote.includes('kind in kinds'));
});

test('device identity is queried from the inference instance, missing or blank stays UNKNOWN', () => {
 assert.ok(ai.includes('instance.onDeviceExtension?.getModelName()?.takeIf { it.isNotBlank() } ?: "UNKNOWN"'));
 assert.ok(ai.includes('catch(_:Exception) { "UNKNOWN" }'));
 assert.ok(ai.includes('modelQueryTime=System.currentTimeMillis()'));
 assert.ok(ai.includes('identity(local)'));
 assert.ok(ai.includes('identity(instance)'));
 assert.ok(ai.includes('responseModelVersion=response.modelVersion'));
 assert.ok(ai.includes('requested STABLE; device-reported model: $reportedModelName'));
 assert.ok(!/Nano[ -]?[34]/i.test(ai), 'no alias guessing');
 assert.ok(ai.includes('modelName="gemini-3.5-flash-lite"'));
});

test('source privacy boundaries and conservative Android semantics remain explicit', () => {
 assert.ok(ai.includes('private val local by lazy { model(InferenceMode.ONLY_ON_DEVICE) }'));
 assert.ok(ai.includes('val instance=model(InferenceMode.ONLY_ON_DEVICE)'));
 assert.equal((ai.match(/check\(response.inferenceSource==com.google.firebase.ai.InferenceSource.ON_DEVICE\)/g) || []).length, 2);
 assert.ok(ai.includes('model(InferenceMode.PREFER_ON_DEVICE).generateContent(exactPayload)'));
 assert.ok(ai.includes('check(cloudAttestationConfigured())'));
 assert.ok(ui.indexOf('p.consume()') < ui.indexOf('provider.approvedHybrid(exact)'));
 assert.ok(privacy.includes('approval = null; return a.revision to a.payload'));
 assert.ok(privacy.includes('accepted.receipt === receipt'));
 assert.ok(quote.includes('original.lineSequence().any { it==claims[index].text }'));
 assert.ok(quote.includes('status=="unsupported" -> "unknown"'));
 assert.ok(privacy.includes('explanation + draft + deadlines + actions + amounts'));
 assert.ok(plan.includes('Android semantics differ from web typed actions'));
 assert.ok(plan.includes('do NOT establish semantic or accuracy parity'));
});

test('runbook binds every current button to a literal visible label', () => {
 const labels = [...ui.matchAll(/\}\) \{ Text\("([^"]+)"\) \}/g)].map(m=>m[1]);
 assert.ok(labels.length >= 12, 'button discovery must not silently stop matching');
 for (const label of labels) assert.ok(plan.includes('**' + label + '**'), 'undocumented control: ' + label);
 for(const label of ['Original synthetic notice (select sensitive text)','Unique role: WRITER, ADDRESSEE, ADDRESS_1…','I confirm ALL content is synthetic, with no real personal data','Privacy ledger — in-memory application bytes, not TLS packets']) {
  assert.ok(ui.includes('"' + label + '"')); assert.ok(plan.includes('**' + label + '**'));
 }
 for (const label of [...plan.matchAll(/\*\*([^*]+)\*\*/g)].map(m=>m[1])) {
  if (/^(NOT_RUN|BLOCKED|\d)/.test(label)) continue;
  assert.ok(ui.includes('"' + label + '"'), 'invented runbook control: ' + label);
 }
 assert.ok(plan.includes('10-minute')); assert.ok(plan.includes('45-minute'));
 assert.ok(plan.includes('**BLOCKED — HTTP transport proof.**'));
 assert.ok(plan.includes('No ledger/response/modelinput export button exists'));
 assert.ok(plan.includes('no planted wrong-deadline UI exists'));
});

test('instrumentation remains explicitly simulated handoff/UI evidence, not inference', () => {
 const instrumentation = read('android/app/src/androidTest/java/com/mizzen/safetosend/NativeContractTest.kt');
 assert.ok(instrumentation.includes('TEST_ONLY simulated — NOT CLOUD'));
 assert.ok(instrumentation.includes('TEST_ONLY unavailable'));
 assert.ok(instrumentation.includes('manualUiRequiresExactApprovalAndShowsRedactedPreview'));
 assert.ok(instrumentation.includes('unavailablePrivatePathCannotFallBack'));
 const variants = ['debug','release'].map(v=>read('android/app/src/' + v + '/java/com/mizzen/safetosend/Attestation.kt'));
 assert.ok(variants[0].includes('DebugAppCheckProviderFactory'));
 assert.ok(variants[1].includes('RecaptchaAppCheckProviderFactory'));
});
