@file:OptIn(com.google.firebase.ai.type.PublicPreviewAPI::class)
package com.mizzen.safetosend

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.google.android.gms.tasks.Tasks
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import java.io.File
import java.util.concurrent.TimeUnit

/** Opt-in REAL SDK request, development debug attestation, NOT production-device proof. */
@RunWith(AndroidJUnit4::class)
class EmulatorCloudTest {
 @get:Rule val compose=createComposeRule()
 @Test fun actualManualRedactedCloudAndUnavailableNano()=runBlocking {
  Assume.assumeTrue(InstrumentationRegistry.getArguments().getString("realEmulatorCloud")=="true")
  val ctx=InstrumentationRegistry.getInstrumentation().targetContext
  val actual=FirebaseProvider(); val vm=SessionModel()
  var cloudFailure="NONE"
  val provider=object: AiProvider by actual {
   override suspend fun approvedHybrid(exactPayload:String):ModelAnswer {
    try { return actual.approvedHybrid(exactPayload) }
    catch(e:Exception) {
     // Only allowlisted categories, never provider text/token/exception dumps.
     val message=e.message.orEmpty().lowercase()
     cloudFailure=when {
      "app check" in message || "appcheck" in message -> "APPCHECK_REJECTED"
      "quota" in message || "resource_exhausted" in message -> "QUOTA_OR_RATE_LIMIT"
      "not found" in message || "not_found" in message -> "MODEL_OR_ENDPOINT_NOT_FOUND"
      "permission" in message || "403" in message -> "PERMISSION_DENIED"
      "billing" in message -> "BILLING_REQUIRED_STOP"
      else -> "PROVIDER_REQUEST_REJECTED"
     }
     throw IllegalStateException("Classified provider rejection")
    }
   }
  }
  val report=JSONObject().put("attestation","REGISTERED_DEBUG_DEVELOPMENT_NOT_PRODUCTION")
   .put("transport","Firebase Android SDK application input; HTTP/TLS bytes NOT observed")
  try {
   report.put("stage","APP_CHECK_TOKEN")
   val token=Tasks.await(FirebaseAppCheck.getInstance(FirebaseApp.getInstance()).getAppCheckToken(false),60,TimeUnit.SECONDS)
   assertTrue(token.token.isNotBlank()); report.put("appCheckTokenObtained",true)
   report.put("stage","NANO_STATUS")
   val availability=provider.status(); report.put("nanoStatus",availability)
   assertFalse(availability.startsWith("AVAILABLE;"))
   report.put("stage","UI_MANUAL_REDACTION")
   compose.setContent { MaterialTheme { SafeScreen(provider,vm) } }
   compose.onNodeWithText("Check Nano availability").performClick()
   compose.waitUntil(60000) { !vm.busy }; Thread.sleep(1500)
   compose.onNodeWithText("Original synthetic notice (select sensitive text)").performScrollTo().performTextInput("Alex\nPay £20 by Friday.")
   compose.onNodeWithText("Original synthetic notice (select sensitive text)").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.SetSelection) { it(0,4,false) }
   compose.onNodeWithText("Redact selected range").performScrollTo().performClick()
   compose.onNode(isToggleable()).performScrollTo().performClick()
   for(label in listOf("Preview exact hybrid payload","Approve this exact payload")) {
    compose.onNodeWithText(label).performScrollTo().performClick(); Thread.sleep(1700)
   }
   val exact=Prompts.response(vm.privacy.redacted())
   assertFalse(exact.contains("Alex")); assertTrue(exact.contains("[WRITER]"))
   report.put("exactApprovedApplicationText",exact).put("sha256",sha256(exact)).put("utf8Bytes",exact.toByteArray(Charsets.UTF_8).size)
   report.put("stage","ACTUAL_SDK_HYBRID_REQUEST")
   compose.onNodeWithText("Run approved hybrid response").performScrollTo().performClick()
   compose.waitUntil(120000) { !vm.busy }
   val ledger=vm.privacy.ledger
   assertTrue(ledger.isNotEmpty()); assertEquals(exact,ledger.first().applicationText)
   report.put("ledgerEntries",ledger.size).put("approvalConsumed",!vm.privacy.isApproved())
   report.put("stage","PARSED_ACCEPTED_CLOUD_RESPONSE").put("cloudFailureCategory",cloudFailure)
   assertNotNull(vm.privacy.currentAnswer()); assertEquals(exact,ledger.last().applicationText)
   report.put("inferenceSource",ledger.last().source); assertEquals(com.google.firebase.ai.InferenceSource.IN_CLOUD.toString(),ledger.last().source)
   report.put("actualCloudResponseAccepted",true)
   compose.onNodeWithText("Hybrid response: In Cloud; NOT yet private-verified").performScrollTo(); Thread.sleep(2500)
   compose.onNodeWithText("Private two-key review — local only").performScrollTo().performClick()
   compose.waitUntil(60000) { !vm.busy }
   report.put("localReview","UNAVAILABLE_EMULATOR_NO_NANO_PROOF")
   compose.onNodeWithText("TEST_ONLY plant wrong deadline").performScrollTo().performClick()
   compose.onNodeWithText("TEST_ONLY planted mutation — NOT CLOUD").performScrollTo(); Thread.sleep(2300)
   compose.onNodeWithText("Privacy ledger — in-memory application bytes, not TLS packets").performScrollTo(); Thread.sleep(2300)
   compose.onNodeWithText("Clear session").performScrollTo().performClick()
   assertTrue(vm.privacy.ledger.isEmpty()); assertEquals("",vm.privacy.source)
   report.put("clearSession",true).put("result","PASS"); Thread.sleep(1500)
  } catch(_:Throwable) {
   report.put("result","BLOCKED_OR_FAILED_NO_PROVIDER_ERROR_LOGGED")
   throw AssertionError("Real emulator cloud path failed; inspect sanitized receipt")
  } finally { File(ctx.filesDir,"emulator-cloud-receipt.json").writeText(report.toString(2)) }
 }
}
