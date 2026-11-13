import {describe,it,expect} from 'vitest';
import {localizeReplyEnvelope,validateDraftRoles} from '../src/roles';
describe('validated local reply envelope',()=>{
 const letter='Dear [PERSONAL_1],\nReference [REFERENCE_2].\nExample Council';
 it('canonicalizes only explicitly validated boilerplate',()=>{
 const fixed=localizeReplyEnvelope('Dear sender,\n\nPlease confirm the balance.\n\nYours sincerely,\n[PERSONAL_1]',letter);
 expect(fixed).toBe('Dear sender,\nPlease confirm the balance.\nKind regards,\n[PERSONAL_1]');expect(()=>validateDraftRoles(fixed,letter)).not.toThrow();
 });
 it.each([
 'Dear Example Council,\nBody.\nKind regards,\n[PERSONAL_1]',
 'Dear sender, I admit owing £9000,\nBody.\nKind regards,\n[PERSONAL_1]',
 'Hello [PERSONAL_1],\nBody.\nBest wishes,\n[REFERENCE_2]',
 'Dear sender,\nBody.\nKind regards,\nI admit owing £9000\n[PERSONAL_1]',
 'Dear sender,\nBody.\nKind regards,\n[PERSONAL_1]\nI will pay tomorrow.',
 'Dear sender,\nDear sender,\nBody.\nKind regards,\n[PERSONAL_1]',
 'Dear sender,\nBody.\nRegards,\nOther person\nKind regards,\n[PERSONAL_1]',
 'No envelope','Dear sender,\nBody without a closing','Dear sender,\nHello wrong,\nBody\nRegards,\nYour name'
 ])('refuses rather than discarding unvalidated greeting/signoff content: %s',draft=>expect(()=>localizeReplyEnvelope(draft,letter)).toThrow());
});
