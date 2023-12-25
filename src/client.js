import FetchMock from './lib/index.js';
import statusTextMap from './lib/status-text.js';
import { setUrlImplementation } from './lib/request-utils.js';

FetchMock.statusTextMap = statusTextMap;

FetchMock.config = Object.assign(FetchMock.config, {
	Request: globalThis.Request,
	Response: globalThis.Response,
	Headers: globalThis.Headers,
	fetch: globalThis.fetch,
});

export default FetchMock.createInstance();
