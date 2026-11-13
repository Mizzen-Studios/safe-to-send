package com.mizzen.safetosend
import com.google.firebase.ai.annotations.Generable
import com.google.firebase.ai.annotations.Guide
import kotlinx.serialization.Serializable
/** Wire field names match canonical shared/nano/contract.json; strict parser remains authoritative. */
@Serializable @Generable data class QuoteFinding(val quote:String,val kind:String) { companion object }
@Serializable @Generable data class QuoteDetection(@Guide(maxItems=1000) val findings:List<QuoteFinding>) { companion object }
@Serializable @Generable data class QuoteEvidence(val quote:String) { companion object }
@Serializable @Generable data class QuoteCheck(val id:String,val status:String,@Guide(maxItems=10) val evidence:List<QuoteEvidence>) { companion object }
@Serializable @Generable data class QuoteReview(@Guide(maxItems=1000) val checks:List<QuoteCheck>) { companion object }
