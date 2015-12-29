'use strict';

const fetchMock = require('../src/server.js');
const fetchCalls = [];
const expect = require('chai').expect;

// we can't use sinon to spy on fetch in these tests as fetch-mock
// uses it internally and sinon doesn't allow spying on a previously
// stubbed function, so just use this very basic stub
const dummyFetch = function () {
	fetchCalls.push([].slice.call(arguments));
	return Promise.resolve(arguments);
};

require('./spec')(fetchMock, GLOBAL, require('node-fetch').Request);

describe('non-global use', function () {

	before(function () {
		try {
			fetchMock.restore();
		} catch (e) {}
	});
	it('stubs non global fetch if function passed in', function () {

		fetchMock.useNonGlobalFetch(dummyFetch);
		expect(fetchMock.realFetch).to.equal(dummyFetch);
		const mock = fetchMock.mock().getMock();
		expect(typeof mock).to.equal('function');
		expect(function () {
			mock('http://url', {prop: 'val'})
		}).not.to.throw();
		expect(fetchMock.calls().unmatched.length).to.equal(1);
		expect(fetchCalls.length).to.equal(1);
		expect(fetchCalls[0]).to.eql(['http://url', {prop: 'val'}]);

		fetchMock.restore();
		fetchMock.usesGlobalFetch = true;
	});
});





