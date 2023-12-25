import fetchMock from '../../src/server.js';

globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch,
};
