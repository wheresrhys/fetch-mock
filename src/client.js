'use strict';

const FetchMock = require('./fetch-mock');

module.exports = new FetchMock({
	theGlobal: window,
	Response: window.Response,
	Headers: window.Headers,
	Blob: window.Blob,
	debug: function () {}
});
