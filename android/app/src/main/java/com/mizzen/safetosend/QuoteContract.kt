package com.mizzen.safetosend
import org.json.JSONObject
import org.json.JSONArray
/** Strict wire validation. Exact quotes are necessary, never semantic proof. */
object QuoteContract {
 private fun keys(j:JSONObject,vararg names:String) = require(j.keys().asSequence().toSet()==names.toSet())
 private fun quote(value:Any, original:String):String {
  require(value is String && value.isNotBlank() && value.length<=5000 && original.contains(value))
  val start=original.indexOf(value); val end=start+value.length
  fun boundary(i:Int)=!(i>0 && i<original.length && original[i-1].isHighSurrogate() && original[i].isLowSurrogate())
  require(boundary(start) && boundary(end)); return value
 }
 fun detection(raw:String,original:String,kinds:Set<String>):List<Pair<String,String>> {
  require(raw.length<=100000 && original.length<=50000)
  val j=JSONObject(raw); keys(j,"findings"); val a=j.getJSONArray("findings"); require(a.length()<=1000)
  val seen=linkedMapOf<String,String>()
  for(i in 0 until a.length()) { val f=a.getJSONObject(i); keys(f,"quote","kind"); val q=quote(f.get("quote"),original); val kind=f.get("kind"); require(kind is String && kind in kinds); require(seen[q]==null || seen[q]==kind); seen[q]=kind }
  return seen.map { it.key to it.value }
 }
 fun claims(answer:Answer)=JSONArray().apply { answer.claims().forEachIndexed { i,c -> put(JSONObject().put("id","claim-$i").put("text",c.text).put("evidence",c.evidence)) } }
 /** Mismatch never becomes a deterministic rejection. Unproven support is UNKNOWN. */
 fun review(raw:String,original:String,answer:Answer):List<String> {
  require(raw.length<=50000 && original.length<=50000)
  val j=JSONObject(raw); keys(j,"checks"); val checks=j.getJSONArray("checks"); val claims=answer.claims(); require(checks.length()==claims.size)
  val seen=mutableSetOf<String>(); val result=MutableList(claims.size){"unknown"}
  for(i in 0 until checks.length()) {
   val c=checks.getJSONObject(i); keys(c,"id","status","evidence"); val id=c.getString("id"); val index=claims.indices.singleOrNull { id=="claim-$it" } ?: error("Unknown claim")
   require(seen.add(id)); val status=c.getString("status"); require(status in setOf("supported","mismatch","unsupported","unknown"))
   val evidence=c.getJSONArray("evidence"); require(evidence.length()<=10)
   val quotes=(0 until evidence.length()).map { val e=evidence.getJSONObject(it); keys(e,"quote"); quote(e.get("quote"),original) }
   // Conservative support: entire assertion AND an entire source line must be identical.
   // Partial substrings cannot discard negation/context; paraphrases remain UNKNOWN.
   result[index]=when { status=="unsupported" -> "unsupported"; status=="supported" && quotes.isNotEmpty() && claims[index].text.isNotBlank() && original.lineSequence().any { it==claims[index].text } && quotes.any { it == claims[index].text } -> "supported"; else -> "unknown" }
  }
  return result
 }
}
