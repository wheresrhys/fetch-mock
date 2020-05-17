import fetchMock from '../esm/client.js';

window.testGlobals = {
	fetchMock,
	theGlobal: window,
	fetch: window.fetch,
	AbortController: window.AbortController,
};
