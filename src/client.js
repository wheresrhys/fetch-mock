'use strict';

const fetchMock = require('./fetch-mock');
const statusTextMap = require('./status-text');
const theGlobal = typeof window !== 'undefined' ? window : self;

module.exports = fetchMock({
	global: theGlobal,
	Request: theGlobal.Request,
	Response: theGlobal.Response,
	Headers: theGlobal.Headers,
	statusTextMap: statusTextMap
});
