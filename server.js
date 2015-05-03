'use strict';

var Response = require('node-fetch').Response;
var Headers = require('node-fetch').Headers;
var sinon = require('sinon');
var stream = require('stream');

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

	var s = new stream.Readable();
	if (config.body != null) {
		var body = config.body;
		if (typeof body === 'object') {
			body = JSON.stringify(body);
		}
		s.push(body, 'utf-8');
	}

	s.push(null);
	return Promise.resolve(new Response(s, opts));
}

var FetchMock = require('./fetch-mock');

module.exports = new FetchMock({
	mockResponse: mockResponse
});
