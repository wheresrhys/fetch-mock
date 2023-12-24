// avoid circular dependency when using jest.mock()
let fetch;
try {
	// note that jest is not a global, but is injected somehow into
	// the environment. So we can't be safe and check for global.jest
	// Hence the try/catch
	fetch = jest.requireActual('node-fetch'); //eslint-disable-line no-undef
} catch (e) {
	fetch = require('node-fetch');
}
const Request = fetch.Request;
const Response = fetch.Response;
const Headers = fetch.Headers;
import Stream from 'stream';
import FetchMock from './lib/index';
import http from 'http';
import { setUrlImplementation } from './lib/request-utils';
import { URL } from 'node:url';
setUrlImplementation(URL);

FetchMock.global = global;
FetchMock.statusTextMap = http.STATUS_CODES;
FetchMock.Stream = Stream;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise,
	Request,
	Response,
	Headers,
	fetch,
});

export default FetchMock.createInstance();
