'use strict';

var Response = window.Response;
var Headers = window.Headers;

function mockResponse (url, config) {
	// allow just body to be passed in as this is the commonest use case
	if (typeof config === 'string' || !(config.body || config.headers || config.throws || config.status)) {
		config = {
			body: config
		};
	}
	if (config.throws) {
		return Promise.reject(config.throws);
	}
	var opts = config.opts || {};
	opts.url = url;
	opts.status = config.status || 200;
	opts.headers = config.headers ? new Headers(config.headers) : new Headers();

	if (config.body != null) {
		var body = config.body;
		if (typeof body === 'object') {
			body = JSON.stringify(body);
		}
	}

	return Promise.resolve(new Response(body, opts));
}

var FetchMock = require('./src/fetch-mock');

module.exports = new FetchMock({
	mockResponse: mockResponse,
	theGlobal: window
});
