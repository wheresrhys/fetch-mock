'use strict';
const fetch = require('node-fetch');
const Request = fetch.Request;
const Response = fetch.Response;
const Headers = fetch.Headers;
const stream = require('stream');
const fetchMock = require('./fetch-mock');
const http = require('http');

module.exports = fetchMock({
	global: global,
	Request: Request,
	Response: Response,
	Headers: Headers,
	stream: stream,
	statusTextMap: http.STATUS_CODES
});
