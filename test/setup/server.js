import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import fetchMock from '../../src/server.js';

globalThis.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};
