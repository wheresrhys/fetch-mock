import fetchMock from '../../dist/commonjs.js';
globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch
};
