import fetchMock from '../esm/server.js';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

global.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
	AbortController,
};
