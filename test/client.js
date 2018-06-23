const fetchMock = require('../src/client.js');
const expect = require('chai').expect;

describe('native fetch behaviour', function () {

	it('should not throw when passing unmatched calls through to native fetch', function () {
		fetchMock.mock(/a/, 200);
		expect(function () {
			fetch('http://www.example.com');
		}).not.to.throw();
		fetchMock.restore();
	});
});

describe('request types that only work in the browser', function () {

	it('respond with blob', function (done) {
		const blob = new Blob();
		fetchMock.mock({
			name: 'route',
			matcher: 'http://it.at.there/',
			response: {body: blob, sendAsJson: false}
		});
		fetch('http://it.at.there/')
			.then(function (res) {
				expect(res.status).to.equal(200);
				res.blob().then(function (blobData) {
					expect(blobData).to.eql(blob);
					fetchMock.restore();
					done();
				});
			});
	});
});

require('./runner')(fetchMock, window, window.fetch);

describe('no real fetch', function () {
	it('should cope when there is no global fetch defined', function () {
		const fetchCache = window.fetch;
		delete window.fetch;
		const realFetchCache = fetchMock.realFetch;
		delete fetchMock.realFetch;
		fetchMock.mock(/a/, 200);
		expect(function () {
			fetch('http://www.example.com');
		}).not.to.throw();

		expect(function () {
			fetchMock.calls();
		}).not.to.throw();
		fetchMock.restore();
		fetchMock.realFetch = realFetchCache;
		window.fetch = fetchCache;
	});
});

describe('service worker', () => {
	it('should work within a service worker', () => {
		return navigator.serviceWorker && navigator.serviceWorker.register('__sw.js')
			.then(registration => {
				return new Promise((resolve, reject) => {
					if (registration.installing) {
						registration.installing.onstatechange = function () {
							if (this.state === 'activated') {
								resolve();
							}
						}
					} else {
						reject('No idea what happened');
					}
				})
					.then(() => {
						expect(true).to.be.true;
						return navigator.serviceWorker.getRegistration()
							.then(registration => registration ? registration.unregister() : false);
					})
			})
	})
})
