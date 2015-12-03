'use strict';

require('whatwg-fetch');

var fetchMock = require('../src/client.js');
var expect = require('chai').expect;

describe('native fetch behaviour', function () {

	it('should not throw when passing unmatched calls through to native fetch', function () {
		fetchMock.mock();
		expect(function () {
			fetch('http://www.example.com');
		}).not.to.throw();
		fetchMock.restore();
	});
})

require('./spec')(fetchMock, window);

