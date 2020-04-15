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

	// this is because we read the body once when normalising the request and
	// want to make sure fetch can still use the sullied request
	it('can still POST a body successfully when spying', async () => {
		fetchMock.spy();
		const req = new fetchMock.config.Request(
			'http://localhost:9876/dummy-file.txt',
			{ method: 'post', body: JSON.stringify({ prop: 'val' }) }
		);
		expect(() => fetch(req)).not.to.throw();
		fetchMock.restore();
	});
});

describe('request types that only work in the browser', function () {
	it('respond with blob', function (done) {
		const blob = new Blob();
		fetchMock.mock('http://it.at.there/', blob, { sendAsJson: false });
		fetch('http://it.at.there/').then(function (res) {
			expect(res.status).to.equal(200);
			res.blob().then(function (blobData) {
				expect(blobData).to.eql(blob);
				fetchMock.restore();
				done();
			});
		});
	});
});

require('./runner')(fetchMock, window, window.fetch, window.AbortController);

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
		return (
			navigator.serviceWorker &&
			navigator.serviceWorker.register('__sw.js').then((registration) => {
				return new Promise((resolve, reject) => {
					if (registration.installing) {
						registration.installing.onstatechange = function () {
							if (this.state === 'activated') {
								resolve();
							}
						};
					} else {
						reject('No idea what happened');
					}
				}).then(() => {
					expect(true).to.be.true;
					return navigator.serviceWorker
						.getRegistration()
						.then((registration) =>
							registration ? registration.unregister() : false
						);
				});
			})
		);
	});
});
