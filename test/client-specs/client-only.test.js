const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { fetchMock } = testGlobals;

describe('client-side only tests', () => {
	afterEach(() => fetchMock.restore());
	it('not throw when passing unmatched calls through to native fetch', () => {
		fetchMock.config.fallbackToNetwork = true;
		fetchMock.mock();
		expect(() => fetch('http://a.com')).not.to.throw();
		fetchMock.config.fallbackToNetwork = false;
	});

	// this is because we read the body once when normalising the request and
	// want to make sure fetch can still use the sullied request
	it('can send a body on a Request instance when spying ', async () => {
		fetchMock.spy();
		const req = new fetchMock.config.Request(
			'http://localhost:9876/dummy-file.txt',
			{ method: 'post', body: JSON.stringify({ prop: 'val' }) }
		);
		let response;
		expect(() => {
			response = fetch(req);
		}).not.to.throw();
		await expect(response).to.not.be.rejected;
	});

	it('respond with blob', async () => {
		const blob = new Blob();
		fetchMock.mock('*', blob, { sendAsJson: false });
		const res = await fetch('http://a.com');
		expect(res.status).to.equal(200);
		const blobData = await res.blob();
		expect(blobData).to.eql(blob);
	});

	it('should cope when there is no global fetch defined', () => {
		const originalFetch = window.fetch;
		delete window.fetch;
		const originalRealFetch = fetchMock.realFetch;
		delete fetchMock.realFetch;
		fetchMock.mock('*', 200);
		expect(() => {
			fetch('http://a.com');
		}).not.to.throw();

		expect(() => {
			fetchMock.calls();
		}).not.to.throw();
		fetchMock.restore();
		fetchMock.realFetch = originalRealFetch;
		window.fetch = originalFetch;
	});

	if (navigator.serviceWorker) {
		it('should work within a service worker', async () => {
			const registration = await navigator.serviceWorker.register('__sw.js');
			await new Promise((resolve, reject) => {
				if (registration.installing) {
					registration.installing.onstatechange = function () {
						if (this.state === 'activated') {
							resolve();
						}
					};
				} else {
					reject('No idea what happened');
				}
			});

			await registration.unregister();
		});
	}
});
