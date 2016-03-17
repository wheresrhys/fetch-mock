'use strict';

const FetchMock = require('./fetch-mock');
const STATUS_TEXT = require('./statusText');

module.exports = new FetchMock({
	theGlobal: window,
	Request: window.Request,
	Response: window.Response,
	Headers: window.Headers,
	STATUS_TEXT: STATUS_TEXT,
	debug: function () {}
});
