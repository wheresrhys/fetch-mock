import FetchMock from './lib/index.js';
import statusTextMap from './lib/status-text.js';
import { setUrlImplementation } from './lib/request-utils.js';

setUrlImplementation(globalThis.URL);

FetchMock.statusTextMap = statusTextMap;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise: globalThis.Promise,
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
});

export default FetchMock.createInstance();
