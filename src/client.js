const FetchMock = require('./lib/index');
const statusTextMap = require('./lib/status-text');
const theGlobal = typeof window !== 'undefined' ? window : self;
const { setUrlImplementation } = require('./lib/request-utils');
setUrlImplementation(theGlobal.URL);

FetchMock.global = theGlobal;
FetchMock.statusTextMap = statusTextMap;

FetchMock.config = Object.assign(FetchMock.config, {
	Promise: theGlobal.Promise,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
});

module.exports = FetchMock.createInstance();
