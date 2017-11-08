'use strict';

const FetchMock = require('./fetch-mock');
const statusTextMap = require('./status-text');
const theGlobal = typeof window !== 'undefined' ? window : self;

FetchMock.global = theGlobal;
FetchMock.statusTextMap = statusTextMap;

instance.config = Object.assign(instance.config, {
	Promise: theGlobal.Promise,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers
});

module.exports = FetchMock;