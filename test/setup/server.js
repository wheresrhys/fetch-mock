import fetchMock from '../../src/server.js';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

globalThis.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};
