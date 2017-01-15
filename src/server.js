'use strict';
const fetch = require('node-fetch');
const Request = fetch.Request;
const Response = fetch.Response;
const Headers = fetch.Headers;
const stream = require('stream');
const FetchMock = require('./fetch-mock');
const http = require('http');

FetchMock.global = global;
FetchMock.statusTextMap = http.STATUS_CODES;
FetchMock.stream = stream;

FetchMock.setImplementations({
	Promise: Promise,
	Request: Request,
	Response: Response,
	Headers: Headers
});

module.exports = new FetchMock()