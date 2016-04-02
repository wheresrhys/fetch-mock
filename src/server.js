'use strict';
const fetch = require('node-fetch');
const Request = fetch.Request;
const Response = fetch.Response;
const Headers = fetch.Headers;
const stream = require('stream');
const FetchMock = require('./fetch-mock');
const http = require('http');

module.exports = new FetchMock({
	theGlobal: global,
	Request: Request,
	Response: Response,
	Headers: Headers,
	stream: stream,
	statusTextMap: http.STATUS_CODES
});
