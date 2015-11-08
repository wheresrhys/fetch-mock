'use strict';

const Response = require('node-fetch').Response;
const Headers = require('node-fetch').Headers;
const stream = require('stream');
const FetchMock = require('./fetch-mock');

module.exports = new FetchMock({
	theGlobal: GLOBAL,
	Response: Response,
	Headers: Headers,
	stream: stream,
	debug: require('debug')('fetch-mock')
});
