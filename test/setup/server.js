import fetchMock from '../../src/index.js';

globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch
};
