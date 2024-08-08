const fetchMock = require('../../dist/cjs/index.js').default;
globalThis.testGlobals = {
	fetchMock,
	fetch: globalThis.fetch,
};
