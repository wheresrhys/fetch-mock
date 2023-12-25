import http from 'http';
import { URL } from 'node:url';
import FetchMock from './lib/index.js';
import { setUrlImplementation } from './lib/request-utils.js';

setUrlImplementation(URL);

FetchMock.statusTextMap = http.STATUS_CODES;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
});

export default FetchMock.createInstance();
