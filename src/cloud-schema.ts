/** Static schema contains no letter/mapping data. SDK responseSchema is serialized on wire. */
export const journeyResponseSchema={type:'object' as const,properties:{
 explanation:{type:'string' as const,description:'Plain English; distinguish sender and recipient; do not assume the identity of a placeholder.'},
 deadlines:{type:'array' as const,maxItems:20,items:{type:'object' as const,properties:{date:{type:'string' as const,nullable:true,description:'YYYY-MM-DD only when supported by the letter; null for unresolved relative dates.'},evidence:{type:'string' as const,description:'Exact verbatim quote occurring in the supplied redacted letter.'},action:{type:'string' as const}},required:['date','evidence','action']}},
 actions:{type:'array' as const,minItems:1,maxItems:20,items:{type:'string' as const}},
 draft:{type:'string' as const,description:'A single draft reply string, not a list. Preserve placeholders; do not invent names, admissions or facts.'}
},required:['explanation','deadlines','actions','draft']};
