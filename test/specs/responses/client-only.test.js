import {
	afterEach, describe, expect, it,
} from 'vitest';
// const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);
const { fetchMock } = testGlobals;

describe.skip('client-side only tests', () => {
	afterEach(() => fetchMock.restore());
	it('not throw when passing unmatched calls through to native fetch', () => {
		fetchMock.config.fallbackToNetwork = true;
		fetchMock.mock();
		expect(() => fetch('http://a.com')).not.to.throw();
		fetchMock.config.fallbackToNetwork = false;
	});

	// this is because we read the body once when normalising the request and
	// want to make sure fetch can still use the sullied request
	it.skip('can send a body on a Request instance when spying ', async () => {
		fetchMock.spy();
		const req = new fetchMock.config.Request(
			'http://example.com',
			{ method: 'post', body: JSON.stringify({ prop: 'val' }) },
		);
		try {
			await fetch(req);
		} catch (err) {
			console.log(err)
			expect.unreachable('Fetch should not throw or reject')
		}
	});

	it('respond with blob', async () => {
		const blob = new Blob();
		fetchMock.mock('*', blob, { sendAsJson: false });
		const res = await fetch('http://a.com');
		expect(res.status).to.equal(200);
		const blobData = await res.blob();
		expect(blobData).to.eql(blob);
	});

	it.skip('should cope when there is no global fetch defined', () => {
		const originalFetch = globalThis.fetch;
		delete globalThis.fetch;
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
		globalThis.fetch = originalFetch;
	});

	if (globalThis.navigator?.serviceWorker) {
		it('should work within a service worker', async () => {
			const registration = await globalThis.navigator.serviceWorker.register('__sw.js');
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
