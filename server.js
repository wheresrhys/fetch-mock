'use strict';

var Response = require('node-fetch').Response;
var Headers = require('node-fetch').Headers;
var stream = require('stream');
var FetchMock = require('./src/fetch-mock');

module.exports = new FetchMock({
	theGlobal: GLOBAL,
	Response: Response,
	Headers: Headers,
	stream: stream,
	debug: require('debug')('fetch-mock')
});
