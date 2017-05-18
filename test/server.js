'use strict';

const fetchMock = require('../src/server.js');
const fetchCalls = [];
const expect = require('chai').expect;
const mockery = require('mockery');

// we can't use sinon to spy on fetch in these tests as fetch-mock
// uses it internally and sinon doesn't allow spying on a previously
// stubbed function, so just use this very basic stub
const dummyFetch = function () {
	fetchCalls.push([].slice.call(arguments));
	return Promise.resolve(arguments);
};


require('./spec')(fetchMock, global, require('node-fetch').Request, require('node-fetch').Response);
require('./custom-header.spec')(fetchMock, global, require('node-fetch').Headers);

describe('support for Buffers', function () {
	it('can respond with a buffer', function () {
		fetchMock.mock(/a/, {
			sendAsJson: false,
			body: new Buffer('buffer')
		})
		return fetch('http://a.com')
			.then(res => res.text())
			.then(txt => {
				expect(txt).to.equal('buffer');
			});
	});
});

describe('new non-global use', function () {

	before(function () {
		try {
			fetchMock.restore();
		} catch (e) {}
		delete global.fetch;
	});

	it('stubs non global fetch if function passed in', function () {
		fetchMock.mock(/a/,200).catch(dummyFetch);
		expect(function () {
			fetchMock.fetchMock('http://url', {prop: 'val'})
		}).not.to.throw();
		expect(fetchMock.calls().unmatched.length).to.equal(1);
		expect(fetchCalls.length).to.equal(1);
		expect(fetchCalls[0]).to.eql(['http://url', {prop: 'val'}]);
		fetchMock.restore();
	});


  it('should work well with mockery', function () {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });
    fetchMock
      .mock('http://auth.service.com/user', '{"foo": 1}')
    mockery.registerMock('node-fetch', fetchMock.fetchMock);
    expect(require('./fixtures/fetch-proxy')).to.equal(fetchMock.fetchMock);
    fetchMock.restore();
    mockery.deregisterMock('node-fetch');
    mockery.disable();
  });

});










