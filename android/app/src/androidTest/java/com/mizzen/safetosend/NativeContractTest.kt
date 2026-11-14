package com.mizzen.safetosend
import android.graphics.Bitmap
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
/** TEST_ONLY provider: simulated application contract, never evidence of actual cloud/Nano. */
private class TestOnlyProvider: AiProvider {
 val calls=mutableListOf<String>()
 override suspend fun status()="UNAVAILABLE (TEST_ONLY emulator)"
 override suspend fun download(update:(String)->Unit) { update("TEST_ONLY unavailable") }
 override suspend fun privateOnly(prompt:String,photo:Bitmap?):String { calls.add("ONLY_ON_DEVICE"); error("TEST_ONLY unavailable") }
 override suspend fun approvedHybrid(exactPayload:String):ModelAnswer { calls.add(exactPayload); return ModelAnswer("TEST_ONLY simulated response","TEST_ONLY simulated — NOT CLOUD") }
}
/** TEST_ONLY suspension/completion controls; no Firebase, Nano or cloud invocation. */
private class SuspendedTestOnlyProvider: AiProvider {
 val completion=CompletableDeferred<String>()
 var photo:Bitmap?=null
 val hybridPayloads=mutableListOf<String>()
 override suspend fun status()="TEST_ONLY unavailable"
 override suspend fun download(update:(String)->Unit) { error("TEST_ONLY unavailable") }
 override suspend fun privateOnly(prompt:String,photo:Bitmap?):String {
  this.photo=photo
  return completion.await()
 }
 override suspend fun approvedHybrid(exactPayload:String):ModelAnswer {
  hybridPayloads.add(exactPayload)
  return ModelAnswer(completion.await(),"TEST_ONLY simulated — NOT CLOUD")
 }
}
@RunWith(AndroidJUnit4::class)
class NativeContractTest {
 @get:Rule val compose=createComposeRule()
 @Test fun runnableUiAndUnavailableStatus() {
  val provider=TestOnlyProvider()
  compose.setContent { MaterialTheme { SafeScreen(provider,SessionModel()) } }
  compose.onNodeWithText("Safe to Send").assertIsDisplayed()
  compose.onNodeWithText("Check Nano availability").performClick()
  compose.waitForIdle()
  compose.onNodeWithText("Nano: UNAVAILABLE (TEST_ONLY emulator)").assertExists()
  assertTrue(provider.calls.isEmpty())
 }
 @Test fun manualUiRequiresExactApprovalAndShowsRedactedPreview() {
  val provider=TestOnlyProvider()
  compose.setContent { MaterialTheme { SafeScreen(provider,SessionModel()) } }
  compose.onNodeWithText("Original synthetic notice (select sensitive text)").performScrollTo().performTextInput("Dear Alex, pay £20")
  compose.onNodeWithText("Original synthetic notice (select sensitive text)").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.SetSelection) { it(5,9,false) }
  compose.onNodeWithText("Redact selected range").performScrollTo().performClick()
  compose.onNodeWithText("Dear [WRITER], pay £20").assertExists()
  compose.onNode(isToggleable()).performScrollTo().performClick()
  compose.onNodeWithText("Preview exact hybrid payload").performScrollTo().performClick()
  compose.onNodeWithText("Run approved hybrid response").performScrollTo().assertIsNotEnabled()
  compose.onNodeWithText("Approve this exact payload").performScrollTo().performClick()
  compose.onNodeWithText("Run approved hybrid response").performScrollTo().assertIsEnabled().performClick()
  compose.waitForIdle()
  assertEquals(1,provider.calls.size)
  assertFalse(provider.calls.single().contains("Alex"))
  assertTrue(provider.calls.single().contains("[WRITER]"))
 }
 @Test fun manualApprovalContractUsesOnlyRedactedBytes()=runBlocking {
  val p=PrivacySession(); val provider=TestOnlyProvider()
  p.change("Dear Alex, pay £20"); p.addSpan(5,9,"WRITER"); p.confirmSynthetic(true)
  val exact=Prompts.response(p.redacted()); p.approve(Prompts.response(p.redacted())); val (_,s)=p.consume()
  val r=provider.approvedHybrid(s)
  assertEquals(exact,provider.calls.single()); assertFalse(provider.calls.single().contains("Alex")); assertTrue(r.source.startsWith("TEST_ONLY")); assertFalse(p.isApproved())
 }
 @Test fun unavailablePrivatePathCannotFallBack()=runBlocking {
  val provider=TestOnlyProvider()
  try {provider.privateOnly("synthetic original",null); fail()} catch(_:IllegalStateException){}
  assertEquals(listOf("ONLY_ON_DEVICE"),provider.calls)
 }
 @Test fun testOnlySuspendedOcrLocksDestructiveControlsUntilCompletion() {
  val provider=SuspendedTestOnlyProvider(); val vm=SessionModel()
  val bitmap=Bitmap.createBitmap(2,2,Bitmap.Config.ARGB_8888)
  vm.photo=bitmap; vm.privacy.change("TEST_ONLY synthetic original")
  compose.setContent { MaterialTheme { SafeScreen(provider,vm) } }
  compose.onNodeWithText("OCR photo — local only").performScrollTo().performClick()
  compose.runOnIdle { assertTrue(vm.busy); assertSame(bitmap,provider.photo); assertFalse(bitmap.isRecycled); assertFalse(vm.begin()) }
  for(label in listOf("Clear session","Choose photo","Camera","OCR photo — local only","Detect sensitive text — local only","Preview exact hybrid payload")) {
   compose.onNodeWithText(label).performScrollTo().assertIsNotEnabled()
  }
  compose.onNodeWithText("Original synthetic notice (select sensitive text)").performScrollTo().assertIsNotEnabled()
  compose.onNode(isToggleable()).performScrollTo().assertIsNotEnabled()
  // Even a queued semantics callback cannot bypass the callback-level guard.
  compose.onNodeWithText("Clear session").performScrollTo().performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.OnClick) { it() }
  compose.runOnIdle {
   assertSame(bitmap,vm.photo); assertFalse(bitmap.isRecycled)
   assertEquals("TEST_ONLY synthetic original",vm.privacy.source)
   assertTrue(vm.privacy.ledger.isEmpty()); assertTrue(provider.hybridPayloads.isEmpty())
   provider.completion.complete("TEST_ONLY OCR synthetic completion")
  }
  compose.waitForIdle()
  compose.runOnIdle { assertFalse(vm.busy); assertNull(vm.photo); assertTrue(bitmap.isRecycled); assertEquals("TEST_ONLY OCR synthetic completion",vm.privacy.source) }
  compose.onNodeWithText("Clear session").performScrollTo().assertIsEnabled().performClick()
  compose.runOnIdle { assertEquals("",vm.privacy.source); assertTrue(vm.privacy.ledger.isEmpty()) }
 }
 @Test fun testOnlySuspendedOcrRejectsStaleRevisionCompletion() {
  val provider=SuspendedTestOnlyProvider(); val vm=SessionModel()
  val bitmap=Bitmap.createBitmap(2,2,Bitmap.Config.ARGB_8888); vm.photo=bitmap
  compose.setContent { MaterialTheme { SafeScreen(provider,vm) } }
  compose.onNodeWithText("OCR photo — local only").performScrollTo().performClick()
  // Deliberate out-of-UI invalidation: stale provider output must not overwrite newer source.
  compose.runOnIdle { vm.privacy.change("TEST_ONLY newer source"); provider.completion.complete("TEST_ONLY stale OCR") }
  compose.waitForIdle()
  compose.runOnIdle { assertFalse(vm.busy); assertEquals("TEST_ONLY newer source",vm.privacy.source); assertSame(bitmap,vm.photo); assertFalse(bitmap.isRecycled); assertTrue(vm.privacy.ledger.isEmpty()); assertTrue(provider.hybridPayloads.isEmpty()) }
  compose.onNodeWithText("Clear session").performScrollTo().performClick()
  compose.runOnIdle { assertTrue(bitmap.isRecycled) }
 }
 @Test fun testOnlySuspendedHybridKeepsOriginalLocalAndClearLocked() {
  val provider=SuspendedTestOnlyProvider(); val vm=SessionModel()
  vm.privacy.change("Dear Alex, pay £20"); vm.privacy.addSpan(5,9,"WRITER"); vm.privacy.confirmSynthetic(true)
  compose.setContent { MaterialTheme { SafeScreen(provider,vm) } }
  compose.onNodeWithText("Preview exact hybrid payload").performScrollTo().performClick()
  compose.onNodeWithText("Approve this exact payload").performScrollTo().performClick()
  compose.onNodeWithText("Run approved hybrid response").performScrollTo().performClick()
  compose.onNodeWithText("Clear session").performScrollTo().assertIsNotEnabled()
  compose.runOnIdle {
   assertTrue(vm.busy); assertEquals(1,provider.hybridPayloads.size)
   assertFalse(provider.hybridPayloads.single().contains("Alex")); assertTrue(provider.hybridPayloads.single().contains("[WRITER]"))
   assertEquals(provider.hybridPayloads.single(),vm.privacy.ledger.single().applicationText)
   // Deliberately invalid JSON: this proves handoff/locking, NOT accepted-answer/two-key success.
   provider.completion.complete("TEST_ONLY non-JSON rejected response")
  }
  compose.waitForIdle()
  compose.runOnIdle { assertFalse(vm.busy); assertNull(vm.privacy.currentAnswer()); assertFalse(vm.privacy.isApproved()) }
  compose.onNodeWithText("Clear session").performScrollTo().assertIsEnabled().performClick()
  compose.runOnIdle { assertEquals("",vm.privacy.source); assertTrue(vm.privacy.ledger.isEmpty()) }
 }

}
