import fetch from 'node-fetch';
import fetchMock from '../../src/server.js';

globalThis.testGlobals = {
	fetchMock,
	theGlobal: global,
	fetch,
};
