import fetchMock from '../../src/client.js';

globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch,
};
