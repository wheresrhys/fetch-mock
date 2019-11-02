import FetchMock from './lib/index';
import statusTextMap from './lib/status-text';
const theGlobal = typeof window !== 'undefined' ? window : self;
import {  setUrlImplementation  } from './lib/request-utils';
setUrlImplementation(theGlobal.URL);

FetchMock.global = theGlobal;
FetchMock.statusTextMap = statusTextMap;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise: theGlobal.Promise,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers
});

export default FetchMock.createInstance();
