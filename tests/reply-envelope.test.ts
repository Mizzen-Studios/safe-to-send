import {describe,it,expect} from 'vitest';
import {localizeReplyEnvelope,validateDraftRoles} from '../src/roles';
describe('local reply roles after real cloud response',()=>{
 const letter='Dear [PERSONAL_1],\nReference [REFERENCE_2].\nExample Council';
 it('rebuilds a plausible but unconfirmed organization greeting without trusting model roles',()=>{
 const fixed=localizeReplyEnvelope('Dear Example Council,\n\nPlease find proof of costs for [REFERENCE_2].\n\nKind regards,\n[PERSONAL_1]',letter);
 expect(fixed).toBe('Dear sender,\nPlease find proof of costs for [REFERENCE_2].\nKind regards,\n[PERSONAL_1]');expect(()=>validateDraftRoles(fixed,letter)).not.toThrow();
 });
 it('discards wrong recipient greetings and unrelated contact signatures',()=>{
 const fixed=localizeReplyEnvelope('Hello [PERSONAL_1],\nPlease confirm the balance.\nBest wishes,\n[REFERENCE_2]',letter);
 expect(fixed).toBe('Dear sender,\nPlease confirm the balance.\nKind regards,\n[PERSONAL_1]');
 });
 it.each(['No envelope','Dear sender,\nBody without a closing','Dear sender,\nHello wrong,\nBody\nRegards,\nYour name'])('refuses missing or ambiguous structure: %s',draft=>expect(()=>localizeReplyEnvelope(draft,letter)).toThrow());
});
