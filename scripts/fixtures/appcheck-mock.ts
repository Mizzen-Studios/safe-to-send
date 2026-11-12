// TEST BUILD ONLY. No attestation or real credentials. Never included in production builds.
export class ReCaptchaEnterpriseProvider{constructor(_key:string){}}
export function initializeAppCheck(app:unknown,_options:unknown){(globalThis as any).__mockCheckInitialized=true;return {app};}
export async function getToken(){return {token:(globalThis as any).__mockNoAttestation?'':'SYNTHETIC_MOCK_ATTESTATION_NOT_A_REAL_TOKEN'};}
