package com.mizzen.safetosend

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.PickVisualMediaRequest
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.CoroutineStart
import java.io.File

class MainActivity : ComponentActivity() { override fun onCreate(state: Bundle?) { super.onCreate(state); setContent { MaterialTheme { SafeScreen() } } } }
class SessionModel : ViewModel() {
 val privacy=PrivacySession()
 var photo:Bitmap?=null
 var busy by mutableStateOf(false); private set
 private var closed=false
 fun begin():Boolean { if(busy || closed) return false; busy=true; return true }
 fun isOpen() = !closed
 fun finish() { busy=false; if(closed) { photo?.recycle(); photo=null; privacy.clear() } }
 override fun onCleared() { closed=true; if(!busy) { photo?.recycle(); photo=null; privacy.clear() } }
}
@Composable fun SafeScreen(provider: AiProvider = FirebaseProvider(), vm: SessionModel = viewModel()) {
 val context=LocalContext.current
 val scope=rememberCoroutineScope()
 val p=vm.privacy
 var input by remember { mutableStateOf(TextFieldValue(p.source)) }
 var status by remember { mutableStateOf("Nano UNKNOWN — check explicitly. Emulator Nano is unavailable.") }
 var tick by remember { mutableIntStateOf(0) }
 val busy=vm.busy
 var payload by remember { mutableStateOf("") }
 var role by remember { mutableStateOf("WRITER") }
 var result by remember { mutableStateOf("") }
 var accepted by remember { mutableStateOf<ModelAnswer?>(null) }
 var acceptedRevision by remember { mutableLongStateOf(-1) }
 var cameraFile by remember { mutableStateOf<File?>(null) }
 var photoRequestRevision by remember { mutableLongStateOf(-1) }
 fun reset() { payload=""; result=""; accepted=null; tick++ }
 fun loadPhoto(bitmap: Bitmap?) { if(vm.busy || !vm.isOpen() || p.revision!=photoRequestRevision) { bitmap?.recycle(); return }; vm.photo?.recycle(); vm.photo=bitmap; p.change(""); input=TextFieldValue(); reset(); status="Photo in memory. OCR uses ONLY_ON_DEVICE; no cloud fallback." }
 val gallery=rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
  if(uri!=null && !vm.busy && vm.isOpen() && p.revision==photoRequestRevision) { val bitmap=try { context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it) } } catch (_:Exception) { null }; loadPhoto(bitmap) }
 }
 val camera=rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok ->
  val f=cameraFile; if(ok && f!=null && !vm.busy && vm.isOpen() && p.revision==photoRequestRevision) loadPhoto(BitmapFactory.decodeFile(f.path)); f?.delete(); cameraFile=null
 }
 // Disabled semantics plus callback guards prevent queued destructive mutations.
 fun task(block:suspend (checkCurrent:()->Unit)->Unit) {
  if(!vm.begin()) return
  val revision=p.revision
  scope.launch(start=CoroutineStart.UNDISPATCHED) {
   val job=coroutineContext[Job]!!
   val checkCurrent={ check(job.isActive && vm.isOpen() && p.revision==revision) { "Stale operation" } }
   try { checkCurrent(); block(checkCurrent) }
   catch (cancelled:CancellationException) { throw cancelled }
   catch (_:Exception) { if(job.isActive && vm.isOpen() && p.revision==revision) status="Operation unavailable or rejected. No unsafe fallback; approval may need renewal." }
   finally { vm.finish(); tick++ }
  }
 }

 Surface { Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
  Text("Safe to Send",style=MaterialTheme.typography.headlineLarge)
  Text("Synthetic notices only • originals stay local • never auto-send")
  Text("Review revision $tick",style=MaterialTheme.typography.bodySmall)
  Text("Android experimental preview. Production attestation UNVERIFIED. No phone/Nano inference claimed.",style=MaterialTheme.typography.bodySmall)
  Text(status)
  Button(enabled=!busy,onClick={ task { current -> val availability=provider.status(); current(); status="Nano: "+availability } }) { Text("Check Nano availability") }
  OutlinedButton(enabled=!busy,onClick={ task { current -> provider.download { current(); status="Model download: $it" }; current(); status="Download finished; check availability" } }) { Text("Download local model (explicit)") }
  Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) {
   OutlinedButton(enabled=!busy,onClick={ if(vm.busy) return@OutlinedButton; photoRequestRevision=p.revision; gallery.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) { Text("Choose photo") }
   OutlinedButton(enabled=!busy,onClick={
    if(vm.busy) return@OutlinedButton
    photoRequestRevision=p.revision
    val dir=File(context.cacheDir,"capture").apply { mkdirs() }; val f=File.createTempFile("capture-",".jpg",dir); cameraFile=f
    camera.launch(FileProvider.getUriForFile(context,context.packageName+".camera",f))
   }) { Text("Camera") }
  }
  Text("Camera uses a temporary private FileProvider file, deleted after capture. Gallery bytes are decoded into memory. Nothing is saved to a library.",style=MaterialTheme.typography.bodySmall)
  if(vm.photo!=null) Button(enabled=!busy,onClick={ task { current ->
   val raw=provider.privateOnly("Transcribe this synthetic notice verbatim. Return only text; no advice.",vm.photo)
   current(); p.change(raw); input=TextFieldValue(raw); vm.photo?.recycle(); vm.photo=null; reset(); status="Local OCR complete; review every character"
  } }) { Text("OCR photo — local only") }
  OutlinedTextField(enabled=!busy,value=input,onValueChange={ if(vm.busy) return@OutlinedTextField; input=it; if(it.text!=p.source) {p.change(it.text); reset()} },label={ Text("Original synthetic notice (select sensitive text)") },modifier=Modifier.fillMaxWidth(),minLines=7)
  Row { Checkbox(enabled=!busy,checked=p.synthetic,onCheckedChange={if(!vm.busy) {p.confirmSynthetic(it); reset()}}); Text("I confirm ALL content is synthetic, with no real personal data") }
  OutlinedTextField(enabled=!busy,value=role,onValueChange={if(!vm.busy) role=it},label={Text("Unique role: WRITER, ADDRESSEE, ADDRESS_1…")})
  Button(enabled=!busy && input.selection.min!=input.selection.max,onClick={ if(vm.busy) return@Button; try {p.addSpan(input.selection.min,input.selection.max,role); role="PRIVATE_${p.revision}"; reset(); status="Selection replaced locally"} catch(_:Exception){status="Select a non-overlapping range and unique uppercase role"} }) { Text("Redact selected range") }
  Button(enabled=!busy && p.source.isNotBlank(),onClick={task { current ->
   val contract=SafeApplication.contract
   val raw=provider.privateJson(contract.getString("detectionPrompt")+"\n"+org.json.JSONObject().put("original",p.source),contract.getJSONObject("detectionSchema"))
   current()
   val kinds=contract.getJSONArray("piiKinds"); val allowed=(0 until kinds.length()).map { kinds.getString(it) }.toSet()
   result=QuoteContract.detection(raw,p.source,allowed).joinToString("\n") { "${it.second}: ${it.first}" }
   status="Local suggestions only; select and redact manually"
  }}) { Text("Detect sensitive text — local only") }
  Text("Redacted notice",style=MaterialTheme.typography.titleMedium)
  Text(p.redacted())
  OutlinedButton(enabled=!busy,onClick={ if(vm.busy) return@OutlinedButton; payload=Prompts.response(p.redacted()); accepted=null; result=""; tick++ }) { Text("Preview exact hybrid payload") }
  if(payload.isNotEmpty()) {
   Text("Exact application text passed to Firebase SDK (NOT HTTP/TLS wire bytes)",style=MaterialTheme.typography.titleMedium)
   Text(payload)
   Button(enabled=!busy && p.synthetic,onClick={ if(vm.busy) return@Button; try {p.approve(payload); tick++; status="Approved exact payload; edits invalidate approval"} catch(_:Exception){ status="Redact at least one selection and confirm synthetic content"} }) { Text("Approve this exact payload") }
  }
  Button(enabled=!busy && p.isApproved() && payload==Prompts.response(p.redacted()),onClick={task { current ->
   val (rev,exact)=p.consume()
   check(exact==payload)
   p.record(exact,"ATTEMPT / PREFER_ON_DEVICE; transport not observed")
   val answer=provider.approvedHybrid(exact)
   current(); check(p.revision==rev)
   val parsed=Prompts.parse(answer.text)
   p.accept(rev,parsed,answer.receipt); accepted=answer; acceptedRevision=rev
   p.record(exact,answer.source); result=answer.text
   status="Hybrid response: ${answer.source}; NOT yet private-verified"
  }}) { Text("Run approved hybrid response") }
  if(result.isNotEmpty()) Text(result)
  Button(enabled=!busy && accepted!=null,onClick={task { current ->
   val bound=accepted!!; val answer=p.currentAnswer() ?: error("Stale")
   val claims=answer.claims()
   val contract=SafeApplication.contract
   val raw=provider.privateJson(contract.getString("verificationPrompt")+"\n"+org.json.JSONObject().put("original",p.source).put("claims",QuoteContract.claims(answer)),contract.getJSONObject("verifierSchema"))
   current()
   val verdicts=QuoteContract.review(raw,p.source,answer)
   val evidence=claims.map { p.restore(it.evidence) }
   val pass=verdicts.all { it=="supported" } && p.validate(acceptedRevision,answer,bound.receipt,evidence)
   status=if(pass) "Two-key conservative verbatim checks passed locally. Not a truth guarantee; review before use." else "Two-key UNKNOWN/unsupported: unproven claims remain locked; no deterministic mismatch claimed"
   if(pass) result=p.restore(bound.text)
  }}) { Text("Private two-key review — local only") }
  Text("Privacy ledger — in-memory application bytes, not TLS packets",style=MaterialTheme.typography.titleMedium)
  p.ledger.forEach { Text("${it.source} • ${it.utf8Bytes} UTF-8 bytes • ${it.time}\nSHA-256 ${it.sha256}\n${it.applicationText}",style=MaterialTheme.typography.bodySmall) }
  OutlinedButton(enabled=!busy,onClick={ if(vm.busy) return@OutlinedButton; vm.photo?.recycle(); vm.photo=null; p.clear(); input=TextFieldValue(); reset(); status="Cleared in-memory session" }) { Text("Clear session") }
  Text("No automatic sending, logs of notices, persistent originals, analytics, or backup. App Check stays enforced; missing private config disables cloud.",style=MaterialTheme.typography.bodySmall)
  Spacer(Modifier.height(30.dp))
 } }
}
