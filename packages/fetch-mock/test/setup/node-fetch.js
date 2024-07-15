import { default as fetch, Headers, Request, Response } from 'node-fetch';

import fetchMock from '../../src/index.js';

fetchMock.config = Object.assign(fetchMock.config, {
	Request,
	Response,
	Headers,
	fetch,
});

globalThis.testGlobals = {
	fetchMock,
	fetch,
};
