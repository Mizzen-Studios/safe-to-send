package com.mizzen.safetosend
import android.graphics.Bitmap
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.runBlocking
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
}
