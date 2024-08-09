import fetchMock from '../../dist/esm/index.js';

globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch,
};
