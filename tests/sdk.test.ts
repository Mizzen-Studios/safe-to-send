import {it,expect,vi,afterEach} from 'vitest';import {createNano} from '../src/nano';
afterEach(()=>vi.unstubAllGlobals());
it('refuses non-browser SDK initialization before any network path exists',()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect(()=>createNano({apiKey:'synthetic',projectId:'synthetic',appId:'synthetic'})).toThrow('Supported browser');expect(fetch).not.toHaveBeenCalled();});
