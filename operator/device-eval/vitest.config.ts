import {defineConfig} from 'vitest/config';
import {resolve} from 'node:path';
// Node SDK is intentionally cloud-only. Exercise the actual browser SDK used by
// the operator bundle, with TEST_ONLY native API injection; never fake cloud.
export default defineConfig({cacheDir:'.openclaw/tmp/vite-cache',resolve:{alias:{'firebase/ai':resolve('node_modules/@firebase/ai/dist/esm/index.esm.js')}},test:{include:['operator/device-eval/collector.test.ts'],maxWorkers:1}});
