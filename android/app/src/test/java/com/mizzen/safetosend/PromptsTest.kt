package com.mizzen.safetosend
import org.junit.Assert.*
import org.junit.Test
class PromptsTest {
 private val json="""{"explanation":[{"text":"Pay £20.","evidence":"Pay £20."}],"draft":[{"text":"Pay £20.","evidence":"Pay £20."}],"deadlines":[],"actions":[],"amounts":[]}"""
 @Test fun actualMarkdownFencesParseWithoutRepairingClaims() {
  val plain=Prompts.parse(json)
  for(prefix in listOf("```json","```")) assertEquals(plain,Prompts.parse("  "+prefix+"\n"+json+"\n```  "))
 }
 @Test(expected=Exception::class) fun arbitraryProseStillRejected() { Prompts.parse("Here is JSON: "+json) }
}
