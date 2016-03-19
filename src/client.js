'use strict';

const FetchMock = require('./fetch-mock');
const statusTextMap = require('./status-text');

module.exports = new FetchMock({
	theGlobal: window,
	Request: window.Request,
	Response: window.Response,
	Headers: window.Headers,
	statusTextMap: statusTextMap
});
