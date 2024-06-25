import { beforeEach, describe, expect, it } from 'vitest';

const { fetchMock } = testGlobals;

describe('fallbackToNetwork', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	it('error by default', () => {
		expect(() => fm.fetchHandler('http://unmocked.com')).toThrow();
	});

	it('not error when configured globally', () => {
		globalThis.fetch = async () => ({ status: 202 }); //eslint-disable-line require-await
		fm.config.fallbackToNetwork = true;
		fm.mock('http://mocked.com', 201);
		expect(() => fm.fetchHandler('http://unmocked.com')).not.toThrow();
		delete globalThis.fetch;
	});

	it('actually falls back to network when configured globally', async () => {
		globalThis.fetch = async () => ({ status: 202 }); //eslint-disable-line require-await
		fetchMock.config.fallbackToNetwork = true;
		fetchMock.mock('http://mocked.com', 201);
		const res = await fetchMock.fetchHandler('http://unmocked.com');
		expect(res.status).toEqual(202);
		fetchMock.restore();
		fetchMock.config.fallbackToNetwork = false;
		delete globalThis.fetch;
	});

	it('actually falls back to network when configured in a sandbox properly', async () => {
		const sbx = fm.sandbox();
		sbx.config.fetch = async () => ({ status: 202 }); //eslint-disable-line require-await
		sbx.config.fallbackToNetwork = true;
		sbx.mock('http://mocked.com', 201);
		const res = await sbx('http://unmocked.com');
		expect(res.status).toEqual(202);
	});

	it('calls fetch with original Request object', async () => {
		const sbx = fm.sandbox();
		let calledWith;
		//eslint-disable-next-line require-await
		sbx.config.fetch = async (req) => {
			calledWith = req;
			return { status: 202 };
		};
		sbx.config.fallbackToNetwork = true;
		sbx.mock('http://mocked.com', 201);
		const req = new sbx.config.Request('http://unmocked.com');
		await sbx(req);
		expect(calledWith).toEqual(req);
	});

	describe('always', () => {
		it('ignores routes that are matched', async () => {
			fm.realFetch = async () => ({ status: 202 }); //eslint-disable-line require-await
			fm.config.fallbackToNetwork = 'always';

			fm.mock('http://mocked.com', 201);
			const res = await fm.fetchHandler('http://unmocked.com');
			expect(res.status).toEqual(202);
		});

		it('ignores routes that are not matched', async () => {
			fm.realFetch = async () => ({ status: 202 }); //eslint-disable-line require-await

			fm.config.fallbackToNetwork = 'always';

			fm.mock('http://mocked.com', 201);
			const res = await fm.fetchHandler('http://unmocked.com');
			expect(res.status).toEqual(202);
		});
	});

	describe.skip('warnOnFallback', () => {
		it('warn on fallback response by default', () => {}); //eslint-disable-line no-empty-function
		it("don't warn on fallback response when configured false", () => {}); //eslint-disable-line no-empty-function
	});
});



// import { Readable, Writable } from 'stream';
// describe('nodejs only tests', () => {
//     describe('support for nodejs body types', () => {



//         // only works in node-fetch@2
//         it.skip('can respond with a readable stream', () =>
//             new Promise((res) => {
//                 const readable = new Readable();
//                 const write = vi.fn().mockImplementation((chunk, enc, cb) => {
//                     cb();
//                 });
//                 const writable = new Writable({
//                     write,
//                 });
//                 readable.push('response string');
//                 readable.push(null);

//                 fetchMock.route(/a/, readable, { sendAsJson: false });
//                 fetchMock.fetchHandler('http://a.com').then((res) => {
//                     res.body.pipe(writable);
//                 });

//                 writable.on('finish', () => {
//                     expect(write.args[0][0].toString('utf8')).to.equal('response string');
//                     res();
//                 });
//             }));

//         // See https://github.com/wheresrhys/fetch-mock/issues/575
//         it('can respond with large bodies from the interweb', async () => {
//             const fm = fetchMock.sandbox();
//             fm.config.fallbackToNetwork = true;
//             fm.route();
//             // this is an adequate test because the response hangs if the
//             // bug referenced above creeps back in
//             await fm
//                 .fetchHandler('http://www.wheresrhys.co.uk/assets/img/chaffinch.jpg')
//                 .then((res) => res.blob());
//         });




// describe.skip('client-side only tests', () => {
//     it('not throw when passing unmatched calls through to native fetch', () => {
//         fetchMock.config.fallbackToNetwork = true;
//         fetchMock.route();
//         expect(() => fetch('http://a.com')).not.to.throw();
//         fetchMock.config.fallbackToNetwork = false;
//     });

//     // this is because we read the body once when normalising the request and
//     // want to make sure fetch can still use the sullied request
//     it.skip('can send a body on a Request instance when spying ', async () => {
//         fetchMock.spy();
//         const req = new fetchMock.config.Request('http://example.com', {
//             method: 'post',
//             body: JSON.stringify({ prop: 'val' }),
//         });
//         try {
//             await fetch(req);
//         } catch (err) {
//             console.log(err);
//             expect.unreachable('Fetch should not throw or reject');
//         }
//     });

//     // in the browser the fetch spec disallows invoking res.headers on an
//     // object that inherits from a response, thus breaking the ability to
//     // read headers of a fake redirected response.
//     if (typeof window === 'undefined') {
//         it('not convert if `redirectUrl` property exists', async () => {
//             fm.route('*', {
//                 redirectUrl: 'http://url.to.hit',
//             });
//             const res = await fm.fetchHandler('http://a.com/');
//             expect(res.headers.get('content-type')).toBeNull();
//         });
//     }



//     it.skip('should cope when there is no global fetch defined', () => {
//         const originalFetch = globalThis.fetch;
//         delete globalThis.fetch;
//         const originalRealFetch = fetchMock.realFetch;
//         delete fetchMock.realFetch;
//         fetchMock.route('*', 200);
//         expect(() => {
//             fetch('http://a.com');
//         }).not.to.throw();

//         expect(() => {
//             fetchMock.calls();
//         }).not.to.throw();
//         fetchMock.restore();
//         fetchMock.realFetch = originalRealFetch;
//         globalThis.fetch = originalFetch;
//     });

//     if (globalThis.navigator?.serviceWorker) {
//         it('should work within a service worker', async () => {
//             const registration =
//                 await globalThis.navigator.serviceWorker.register('__sw.js');
//             await new Promise((resolve, reject) => {
//                 if (registration.installing) {
//                     registration.installing.onstatechange = function () {
//                         if (this.state === 'activated') {
//                             resolve();
//                         }
//                     };
//                 } else {
//                     reject('No idea what happened');
//                 }
//             });

//             await registration.unregister();
//         });
//     }

// });






