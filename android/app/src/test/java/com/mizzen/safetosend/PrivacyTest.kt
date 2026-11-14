package com.mizzen.safetosend
import org.junit.Assert.*
import org.junit.Test
class PrivacyTest {
 private fun session() = PrivacySession().apply { change("Dear Alex, pay £20 by Friday. From Sam"); addSpan(5,9,"WRITER"); addSpan(35,38,"ADDRESSEE"); confirmSynthetic(true) }
 @Test fun approvalIsOneUse() { val p=session(); p.approve(Prompts.response(p.redacted())); assertTrue(p.isApproved()); p.consume(); assertFalse(p.isApproved()) }
 @Test fun editInvalidates() { val p=session(); p.approve(Prompts.response(p.redacted())); p.change(p.source+"!"); assertFalse(p.isApproved()) }
 @Test fun spanInvalidates() { val p=session(); p.approve(Prompts.response(p.redacted())); p.addSpan(15,18,"AMOUNT"); assertFalse(p.isApproved()) }
 @Test fun syntheticChangeInvalidates() { val p=session(); p.approve(Prompts.response(p.redacted())); p.confirmSynthetic(false); assertFalse(p.isApproved()) }
 @Test(expected=IllegalArgumentException::class) fun originalNeverApproved() { val p=session(); p.approve(p.source) }
 @Test(expected=IllegalArgumentException::class) fun overlapRejected() { val p=session(); p.addSpan(6,10,"OTHER") }
 @Test fun rolesRestoreLocally() { val p=session(); assertEquals("Dear Sam, I am Alex",p.restore("Dear [ADDRESSEE], I am [WRITER]")) }
 @Test fun ledgerHasExactApplicationBytes() { val p=session(); p.record("£20","TEST_ONLY"); val l=p.ledger.single(); assertEquals(4,l.utf8Bytes); assertEquals(sha256("£20"),l.sha256); assertEquals("£20",l.applicationText) }
 @Test fun allSectionsAndExactQuotesRequired() { val p=session(); val claim=Claim("Pay","pay £20"); val answer=Answer(listOf(claim),listOf(claim),listOf(claim),listOf(claim),listOf(claim)); val r=Any(); p.accept(p.revision,answer,r); assertTrue(p.validate(p.revision,answer,r,List(5){"pay £20"})); assertFalse(p.validate(p.revision,answer,r,List(4){"pay £20"})); assertFalse(p.validate(p.revision,answer,r,List(5){"pay £30"})) }
 @Test fun copiedResponseReceiptAndReplayRejected() { val p=session(); val a=Answer(listOf(Claim("Pay","pay £20")),emptyList(),emptyList(),emptyList(),emptyList()); val r=Any(); val rev=p.revision; p.accept(rev,a,r); assertFalse(p.validate(rev,a,Any(),listOf("pay £20"))); assertFalse(p.validate(rev,a.copy(),r,listOf("pay £20"))); p.change(p.source); assertFalse(p.validate(rev,a,r,listOf("pay £20"))) }
 @Test fun evidenceRolesRestoreOnlyLocally() { val p=session(); val a=Answer(listOf(Claim("Writer","Dear [WRITER]")),emptyList(),emptyList(),emptyList(),emptyList()); val r=Any(); p.accept(p.revision,a,r); assertTrue(p.validate(p.revision,a,r,listOf("Dear Alex"))); assertFalse(p.validate(p.revision,a,r,listOf("Dear [WRITER]"))) }
 @Test(expected=IllegalArgumentException::class) fun existingRoleTokenRejected() { PrivacySession().apply { change("Alex [WRITER]"); addSpan(0,4,"WRITER") } }
 @Test fun plantedWrongDeadlineRejected() { val p=session(); val a=Answer(listOf(Claim("Notice","pay £20")),listOf(Claim("I will pay","pay £20")),listOf(Claim("Due Monday","Monday")),emptyList(),emptyList()); val r=Any(); p.accept(p.revision,a,r); assertFalse(p.validate(p.revision,a,r,listOf("pay £20","pay £20","Monday"))); assertFalse(p.validate(p.revision,a,r,listOf("pay £20","pay £20","Friday"))) }
 @Test fun clearDropsOriginalAndLedger() { val p=session(); p.record("redacted","TEST_ONLY"); p.clear(); assertEquals("",p.source); assertTrue(p.ledger.isEmpty()) }
 @Test fun clearRejectsSuspendedAnswerRevision() {
  val p=session(); val revision=p.revision
  val answer=Answer(listOf(Claim("Pay","pay £20")),emptyList(),emptyList(),emptyList(),emptyList())
  p.clear()
  try { p.accept(revision,answer,Any()); fail("stale answer accepted after clear") } catch(_:IllegalStateException) {}
  assertNull(p.currentAnswer()); assertFalse(p.isApproved()); assertTrue(p.ledger.isEmpty())
 }
 @Test fun sourceReplacementRejectsSuspendedAnswerRevision() {
  val p=session(); val revision=p.revision
  val answer=Answer(listOf(Claim("Pay","pay £20")),emptyList(),emptyList(),emptyList(),emptyList())
  p.change("TEST_ONLY newer synthetic notice")
  try { p.accept(revision,answer,Any()); fail("stale answer accepted after edit") } catch(_:IllegalStateException) {}
  assertNull(p.currentAnswer()); assertEquals("TEST_ONLY newer synthetic notice",p.source)
 }

}
