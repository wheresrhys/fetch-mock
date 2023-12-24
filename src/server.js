// avoid circular dependency when using jest.mock()
import Stream from 'stream';
import http from 'http';
import { URL } from 'node:url';
import FetchMock from './lib/index';
import { setUrlImplementation } from './lib/request-utils';

let fetch;
try {
	// note that jest is not a global, but is injected somehow into
	// the environment. So we can't be safe and check for global.jest
	// Hence the try/catch
	fetch = jest.requireActual('node-fetch'); // eslint-disable-line no-undef
} catch (e) {
	fetch = require('node-fetch');
}
const { Request } = fetch;
const { Response } = fetch;
const { Headers } = fetch;
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
