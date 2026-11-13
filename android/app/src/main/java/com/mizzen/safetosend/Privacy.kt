package com.mizzen.safetosend

import java.security.MessageDigest
import java.util.UUID

data class Span(val start: Int, val end: Int, val role: String)
data class LedgerEntry(val applicationText: String, val utf8Bytes: Int, val sha256: String, val time: Long, val source: String)
data class Claim(val text: String, val evidence: String)
data class Answer(val explanation: List<Claim>, val draft: List<Claim>, val deadlines: List<Claim>, val actions: List<Claim>, val amounts: List<Claim>) {
 fun claims() = explanation + draft + deadlines + actions + amounts
}
fun sha256(s: String): String = MessageDigest.getInstance("SHA-256").digest(s.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) }

/** Originals and the ledger live only in process memory. Approval is a one-use capability. */
class PrivacySession {
 var source: String = ""; private set
 var revision: Long = 0; private set
 var synthetic: Boolean = false; private set
 private val spans = mutableListOf<Span>()
 private var approval: Approval? = null
 private var response: Accepted? = null
 val ledger = mutableListOf<LedgerEntry>()
 private data class Approval(val revision: Long, val payload: String, val nonce: String)
 private data class Accepted(val revision: Long, val answer: Answer, val receipt: Any)
 fun change(text: String) { source = text; spans.clear(); synthetic = false; invalidate() }
 fun confirmSynthetic(value: Boolean) { synthetic = value; invalidate() }
 private fun invalidate() { revision++; approval = null; response = null }
 fun addSpan(start: Int, end: Int, role: String) {
  require(start >= 0 && end <= source.length && end > start)
  require(role.matches(Regex("[A-Z][A-Z_0-9]{0,30}")))
  require(spans.none { start < it.end && end > it.start || role == it.role })
  spans.add(Span(start,end,role)); invalidate()
 }
 fun redacted(): String { var s = source; spans.sortedByDescending { it.start }.forEach { s = s.replaceRange(it.start,it.end,"[${it.role}]") }; return s }
 fun approve(exactVisiblePayload: String) {
  require(synthetic && spans.isNotEmpty() && exactVisiblePayload == Prompts.response(redacted()) && exactVisiblePayload != source)
  approval = Approval(revision, exactVisiblePayload, UUID.randomUUID().toString())
 }
 fun isApproved() = approval?.let { it.revision == revision && it.payload == Prompts.response(redacted()) && synthetic } == true
 /** Consume before suspending so repeated taps cannot replay a handoff. */
 fun consume(): Pair<Long,String> { check(isApproved()); val a = approval!!; approval = null; return a.revision to a.payload }
 fun record(payload: String, source: String) { ledger.add(LedgerEntry(payload,payload.toByteArray(Charsets.UTF_8).size,sha256(payload),System.currentTimeMillis(),source)) }
 fun accept(rev: Long, answer: Answer, receipt: Any) { check(rev == revision); response = Accepted(rev,answer,receipt) }
 fun currentAnswer(): Answer? = response?.takeIf { it.revision == revision }?.answer
 fun validate(rev: Long, answer: Answer, receipt: Any, evidence: List<String>): Boolean {
  val accepted = response ?: return false
  return accepted.revision == rev && rev == revision && accepted.answer === answer && accepted.receipt === receipt &&
   answer.claims().isNotEmpty() && evidence.size == answer.claims().size &&
   answer.claims().zip(evidence).all { (claim, quote) -> quote.isNotBlank() && quote == claim.evidence && source.contains(quote) }
 }
 fun restore(text: String): String { var s = text; spans.forEach { s = s.replace("[${it.role}]",source.substring(it.start,it.end)) }; return s }
 fun clear() { source=""; spans.clear(); synthetic=false; ledger.clear(); invalidate() }
}
