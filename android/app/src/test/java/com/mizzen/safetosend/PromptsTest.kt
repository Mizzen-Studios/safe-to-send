package com.mizzen.safetosend
import org.junit.Assert.*
import org.junit.Test
class PromptsTest {
 private val json="""{"explanation":[{"text":"Pay £20.","evidence":"Pay £20."}],"draft":[{"text":"Pay £20.","evidence":"Pay £20."}],"deadlines":[],"actions":[],"amounts":[]}"""
 @Test fun actualMarkdownFencesParseWithoutRepairingClaims() {
  val plain=Prompts.parse(json)
  for(prefix in listOf("```json","```")) assertEquals(plain,Prompts.parse("  "+prefix+"\n"+json+"\n```  "))
 }
 @Test fun strictRejectionsHavePublicCodesWithoutResponseText() {
  fun rejects(raw:String,code:String) {
   try { Prompts.parse(raw); fail("Must reject") } catch(e:IllegalArgumentException) { assertEquals(code,e.message) }
  }
  rejects(org.json.JSONObject(json).put("extra",true).toString(),"ANSWER_ROOT_KEY_SET")
  val wrongClaim=org.json.JSONObject(json); wrongClaim.getJSONArray("explanation").getJSONObject(0).put("extra",true)
  rejects(wrongClaim.toString(),"ANSWER_CLAIM_KEY_SET")
  val blank=org.json.JSONObject(json); blank.getJSONArray("draft").getJSONObject(0).put("evidence","")
  rejects(blank.toString(),"ANSWER_EMPTY_CLAIM")
  rejects(org.json.JSONObject(json).put("draft",org.json.JSONArray()).toString(),"ANSWER_EMPTY_REQUIRED_ARRAY")
 }
 @Test fun promptRequestsExistingStrictShapeRatherThanRelaxingParser() {
  val exact=Prompts.response("[WRITER]\nPay £20 by Friday.")
  assertTrue(exact.contains("exactly two string fields: text and evidence"))
  assertTrue(exact.contains("explanation and draft must each contain at least one"))
  assertTrue(exact.endsWith("<notice>\n[WRITER]\nPay £20 by Friday.\n</notice>"))
 }
 @Test(expected=Exception::class) fun arbitraryProseStillRejected() { Prompts.parse("Here is JSON: "+json) }
}
