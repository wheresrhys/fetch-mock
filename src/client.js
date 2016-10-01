'use strict';

const FetchMock = require('./fetch-mock');
const statusTextMap = require('./status-text');
const theGlobal = typeof window !== 'undefined' ? window : self;

module.exports = new FetchMock({
	theGlobal: theGlobal,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
	statusTextMap: statusTextMap
});
