import http from 'http';
import FetchMock from './lib/index.js';
import { setUrlImplementation } from './lib/request-utils.js';

FetchMock.statusTextMap = http.STATUS_CODES;

FetchMock.config = Object.assign(FetchMock.config, {
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
});

export default FetchMock.createInstance();
