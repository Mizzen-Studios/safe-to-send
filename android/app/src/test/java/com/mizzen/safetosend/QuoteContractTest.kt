package com.mizzen.safetosend
import org.junit.Assert.*
import org.junit.Test
class QuoteContractTest {
 private val answer=Answer(listOf(Claim("Pay £20","Pay £20")),emptyList(),emptyList(),emptyList(),emptyList())
 private fun wire(status:String,quote:String="Pay £20")="""{"checks":[{"id":"claim-0","status":"$status","evidence":[{"quote":"$quote"}]}]}"""
 @Test fun exactDetection() { assertEquals(listOf("Alex" to "NAME"),QuoteContract.detection("""{"findings":[{"quote":"Alex","kind":"NAME"}]}""","Alex and Alex",setOf("NAME"))) }
 @Test(expected=IllegalArgumentException::class) fun absentQuoteFails() { QuoteContract.detection("""{"findings":[{"quote":"Sam","kind":"NAME"}]}""","Alex",setOf("NAME")) }
 @Test(expected=IllegalArgumentException::class) fun offsetsRejected() { QuoteContract.detection("""{"findings":[{"quote":"Alex","kind":"NAME","start":0}]}""","Alex",setOf("NAME")) }
 @Test fun sharedContractIsCanonicalAsset() { val file=java.io.File("../../shared/nano/contract.json"); val j=org.json.JSONObject(file.readText()); assertEquals("quotes-v1",j.getString("version")); assertTrue(j.getString("detectionPrompt").contains("Never return offsets")); assertEquals(setOf("checks"),j.getJSONObject("verifierSchema").getJSONObject("properties").keys().asSequence().toSet()) }
 @Test fun mismatchIsUnknown() { assertEquals(listOf("unknown"),QuoteContract.review(wire("mismatch"),"Pay £20",answer)) }
 @Test fun unrelatedRealQuoteNotSupport() { assertEquals(listOf("unknown"),QuoteContract.review(wire("supported","Hello"),"Hello. Pay £20",answer)) }
 @Test fun paraphraseNotDeterministicProof() { val a=answer.copy(explanation=listOf(Claim("You owe £20","Pay £20"))); assertEquals(listOf("unknown"),QuoteContract.review(wire("supported"),"Pay £20",a)) }
 @Test fun negatedSubstringUnknown() { assertEquals(listOf("unknown"),QuoteContract.review(wire("supported"),"Do not Pay £20",answer)) }
 @Test fun wholeVerbatimClaimCanPass() { assertEquals(listOf("supported"),QuoteContract.review(wire("supported"),"Pay £20",answer)) }
 @Test(expected=IllegalArgumentException::class) fun inventedEvidenceFails() { QuoteContract.review(wire("supported","Pay £30"),"Pay £20",answer) }
 @Test(expected=IllegalArgumentException::class) fun missingClaimsFails() { QuoteContract.review("""{"checks":[]}""","Pay £20",answer) }
}
