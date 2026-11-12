/** Roles come from operator selection or an explicit salutation, never token order. */
export type LetterRoles={recipient:string|null;sender:string|null};
const token=/^\[[A-Z_]+_[1-9]\d*\]$/;
export function validateRoles(letter:string,roles:LetterRoles):LetterRoles{
 for(const role of [roles.recipient,roles.sender])if(role!==null&&(!token.test(role)||!letter.includes(role)))throw Error('Role must reference an existing redacted placeholder');
 if(roles.recipient!==null&&roles.recipient===roles.sender)throw Error('Sender and recipient must differ');
 return {...roles};
}
export function inferRoles(letter:string):LetterRoles{
 const recipient=letter.match(/(?:^|\n)Dear\s+(\[[A-Z_]+_[1-9]\d*\])[,\s]/i)?.[1]??null;
 // Addresses/emails/phones in the body may belong to either party: never guess.
 return validateRoles(letter,{recipient,sender:null});
}
export function replyEnvelope(letter:string,roles:LetterRoles=inferRoles(letter)){
 const r=validateRoles(letter,roles);
 return {salutation:r.sender?'Dear '+r.sender+',':'Dear sender,',signature:r.recipient??'Your name'};
}
export function validateDraftRoles(draft:string,letter:string,roles:LetterRoles=inferRoles(letter)){
 const r=validateRoles(letter,roles);
 const greeting=draft.match(/^\s*Dear\s+([^\n,]+)[,\n]/i)?.[1];
 if(greeting&&greeting.toLowerCase()!=='sender'&&greeting!==r.sender)throw Error('Draft addressee is not the confirmed sender');
 const signature=draft.match(/(?:Kind regards|Yours sincerely|Yours faithfully|Regards|Sincerely),?\s*\n[ \t]*([^\n]+)/i)?.[1].trim();
 if(signature&&signature!=='Your name'&&signature!==r.recipient)throw Error('Draft signature is not the confirmed recipient');
}
