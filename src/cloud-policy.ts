/** Source-reviewed release only. No URL/storage/runtime switch. */
export const CLOUD_RELEASE_ENABLED:boolean=true;
export const CLOUD_MODEL='gemini-3.5-flash-lite';
export const RAW_ORIGIN='https://safe-to-send-2026.web.app';
export const BROKER_ORIGIN='https://safe-to-send-cloud-2026.web.app';
export function assertCloudRelease(){if(!CLOUD_RELEASE_ENABLED)throw Error('Cloud locked: parent privacy/App Check/free-tier/wire-ledger review required');}
