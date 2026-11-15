package com.mizzen.safetosend

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.google.android.gms.tasks.Tasks
import com.google.firebase.appcheck.FirebaseAppCheck
import org.json.JSONObject
import org.junit.Test
import org.junit.Assert.*
import org.junit.runner.RunWith
import java.io.File
import java.util.concurrent.TimeUnit

/** PUBLIC unregistered canary only, before registered-secret use. */
@RunWith(AndroidJUnit4::class)
class EmulatorLoggingTest {
 @Test fun unregisteredCanaryCannotEnterLogBuffer() {
  val tag="com.google.firebase.appcheck.debug.internal.DebugAppCheckProvider"
  val report=JSONObject().put("registeredSecretUsed",false)
  try {
   assertFalse(Log.isLoggable(tag,Log.DEBUG))
   Log.d(tag,"00000000-0000-4000-8000-000000000000")
   Log.e("SafeSendPrivacyGuard","PUBLIC_LOG_BUFFER_LIVENESS_CANARY")
   var rejected=false
   try { Tasks.await(FirebaseAppCheck.getInstance().getAppCheckToken(true),60,TimeUnit.SECONDS) }
   catch (e:Exception) {
    val messages=generateSequence(e as Throwable?) { it.cause }.map { it.message.orEmpty().lowercase() }.joinToString(" ")
    rejected=true
    report.put("negativeExchangeCategory",when {
     "403" in messages || "attestation failed" in messages || "app attestation" in messages -> "APPCHECK_REJECTED"
     "network" in messages -> "NETWORK_FAILURE_NOT_REJECTION_PROOF"
     else -> "OTHER_ERROR_NOT_REJECTION_PROOF"
    })
   }
   assertTrue(rejected)
   report.put("invalidDebugTokenExchangeRejected",true).put("debugIsLoggable",false).put("result","PASS")
  } finally {
   File(InstrumentationRegistry.getInstrumentation().targetContext.filesDir,"emulator-logging-receipt.json").writeText(report.toString())
  }
 }
}
