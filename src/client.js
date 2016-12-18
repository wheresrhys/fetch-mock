'use strict';

const FetchMock = require('./fetch-mock');
const statusTextMap = require('./status-text');
const theGlobal = typeof window !== 'undefined' ? window : self;

FetchMock.setGlobals({
	global: theGlobal,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
	statusTextMap: statusTextMap
});

module.exports = new FetchMock()