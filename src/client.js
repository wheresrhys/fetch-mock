'use strict';

const FetchMock = require('./fetch-mock');

module.exports = new FetchMock({
	theGlobal: window,
	Request: window.Request,
	Response: window.Response,
	Headers: window.Headers,
	debug: function () {}
});
