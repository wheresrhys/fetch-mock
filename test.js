'use strict';

var fetchCalls = [];
var expect = require('chai').expect;
var sinon = require('sinon');

// we can't use sinon to spy on fetch in these tests as fetch-mock
// uses it internally and sinon doesn't allow spying on a previously
// stubbed function, so just use this very basic stub
var dummyFetch = GLOBAL.fetch = function () {
	fetchCalls.push([].slice.call(arguments));
	return Promise.resolve();
};

var fetchMock = require('./index.js');

describe('fetch-mock', function () {

	afterEach(function () {
		fetchCalls = [];
	});

	describe('default behaviour', function () {

		it('call fetch if no routes defined', function () {
			fetchMock.mock();
			fetch();
			expect(fetchCalls.length).to.equal(1);
			fetchMock.restore();
		});

		it('restores fetch', function () {
			fetchMock.mock();
			fetchMock.restore();
			expect(fetch).to.equal(dummyFetch);
		});

		it('throw() if attempting to mock more than once', function () {
			fetchMock.mock();
			expect(function () {
				fetchMock.mock();
			}).to.throw();
			fetchMock.restore();
		});

		it('allow remocking after being restored', function () {
			fetchMock.mock();
			fetchMock.restore();
			expect(function () {
				fetchMock.mock();
				fetchMock.restore();
			}).not.to.throw();
		});

		it('turn fetch into a sinon stub', function () {
			fetchMock.mock();
			expect(typeof fetch.called).to.equal('boolean');
			fetchMock.restore();
		});

	});

	describe('mocking fetch calls', function () {
		afterEach(function () {
			try {
				fetchMock.restore();
			} catch (e) {}
		});
		describe('api parameters', function () {

			it('accepts a single route', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', matcher: 'http://it.at.there', response: 'ok'}
					});
				}).not.to.throw();
			});

			it('accepts an array of routes', function () {
				expect(function () {
					fetchMock.mock({
						routes: [{name: 'route1', matcher: 'http://it.at.there', response: 'ok'}, {name: 'route2', matcher: 'http://it.at.there', response: 'ok'}]
					});
				}).not.to.throw();
			});

			it('expects a name', function () {
				expect(function () {
					fetchMock.mock({
						routes: {matcher: 'http://it.at.there', response: 'ok'}
					});
				}).to.throw();
			});

			it('expects a matcher', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', response: 'ok'}
					});
				}).to.throw();
			});

			it('expects a reponse', function () {
				expect(function () {
					fetchMock.mock({
						routes: {name: 'route', matcher: 'http://it.at.there'}
					});
				}).to.throw();
			});

			it('expects unique route names', function () {
				expect(function () {
					fetchMock.mock({
						routes: [{name: 'route', matcher: 'http://it.at.there', response: 'ok'}, {name: 'route', matcher: 'http://it.at.there', response: 'ok'}]
					});
				}).to.throw();
			});
		});

		describe.only('unmatched routes', function () {
			it('record history of unmatched routes', function (done) {
				fetchMock.mock();
				Promise.all([fetch('http://1', {opts: 1}), fetch('http://2', {opts: 2})])
					.then(function () {
						var unmatchedCalls = fetchMock.calls('__unmatched');
						expect(unmatchedCalls.length).to.equal(2);
						expect(unmatchedCalls[0]).to.eql(['http://1', {opts: 1}]);
						expect(unmatchedCalls[1]).to.eql(['http://2', {opts: 2}]);
						done();
					})
			});

			// it('configure to send good responses', function (done) {

			// });

			// it('configure to send bad responses', function (done) {

			// });

			// it('configure to pass through to native fetch', function (done) {

			// });

		});

		describe('route matching', function () {
			it('match exact strings', function (done) {
				fetchMock.mock({
					routes: {
						name: 'route',
						matcher: 'http://it.at.there',
						response: 'ok'
					}
				});
				// Promise.all[fetch()
			});

			it('match strings starting with a string', function (done) {

			});

			it('match regular expressions', function (done) {

			});

			it('match using custom functions', function (done) {

			});

			it('match multiple routes', function (done) {

			});

			it('match first compatible route when many routes match', function (done) {

			});

			it('record history of calls to matched routes', function (done) {

			});

			it('be possible to reset call history', function (done) {

			});

			it('restoring clears call history', function (done) {

			});

		});

		describe('responses', function () {
			it('respond with a string', function (done) {

			});

			it('respond with a json', function (done) {

			});

			it('respond with a status', function (done) {

			});

			it('respond with a complex response, including headers', function (done) {

			});

			it('imitate a failed request', function (done) {

			});

			it('construct a response based on the request', function (done) {

			});

		});



	});

	describe('persistent route config', function () {
		it('register a single route', function (done) {

		});

		it('register multiple routes', function (done) {

		});

		it('expects unique route names', function (done) {

		});

		it('unregister a single route', function (done) {

		});

		it('unregister multiple routes', function (done) {

		});

		it('use all registered routes in a mock by default', function (done) {

		});

		it('use selection of registered routes', function (done) {

		});

		it('override response for a registered route', function (done) {

		});

	});

});