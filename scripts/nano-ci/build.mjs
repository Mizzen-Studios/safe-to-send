import {build} from 'vite';
import {resolve} from 'node:path';
await build({configFile:false,root:resolve('scripts/nano-ci'),build:{outDir:'site',emptyOutDir:true,rollupOptions:{input:resolve('scripts/nano-ci/index.html')}}});
