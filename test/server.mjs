import fetchMock from '../esm/server.js';
import runner from './runner.js';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import serverOnly from './specs/server-only.test.js';

describe('nodejs tests', () => {
	runner(fetchMock, global, fetch, AbortController);
	serverOnly(fetchMock);
});
