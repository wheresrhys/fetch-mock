import FetchMock from './lib/index.js';
import statusTextMap from './lib/status-text.js';
import { setUrlImplementation } from './lib/request-utils.js';

const theGlobal = typeof window !== 'undefined' ? window : self;
setUrlImplementation(theGlobal.URL);

FetchMock.global = theGlobal;
FetchMock.statusTextMap = statusTextMap;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise: theGlobal.Promise,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
});

export default FetchMock.createInstance();
