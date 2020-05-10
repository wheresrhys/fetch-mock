import fetchMock from '../esm/client.js';
import runner from './runner.js';
import clientOnly from './specs/client-only.test.js';

clientOnly(fetchMock);
runner(fetchMock, window, window.fetch, window.AbortController);
