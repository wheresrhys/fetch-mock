import fetchMock from '../../src/client.js';

window.testGlobals = {
	fetchMock,
	theGlobal: window,
	fetch: window.fetch,
	AbortController: window.AbortController,
};
