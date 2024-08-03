import { describe, expect, it } from 'vitest';
import fetchMock from '../FetchMock';
describe('router integration', () => {
	it('matchurls  when called with Request', async () => {
		const fm = fetchMock.createInstance();
		fm.post('http://a.com/', 200).catch();

		await expect(
			fm.fetchHandler(
				new fm.config.Request('http://a.com/', { method: 'POST' }),
			),
		).resolves.not.toThrow();
	});

	it('match using custom function with Request', async () => {
		const fm = fetchMock.createInstance();
		fm.route(({ url, options }) => {
			return url.indexOf('logged-in') > -1 && options.headers.authorized;
		}, 200);

		await expect(
			fm.fetchHandler(
				new Request('http://a.com/logged-in', {
					headers: { authorized: 'true' },
				}),
			),
		).resolves.not.toThrow();
	});

	it('overrides options embed in Request with second parameter options', async () => {
		const fm = fetchMock.createInstance();
		fm.route({ method: 'post' }, 200);

		await expect(
			fm.fetchHandler(new Request('http://a.com', { method: 'post' }), {
				method: 'get',
			}),
		).rejects.toThrow();
		await expect(
			fm.fetchHandler(new Request('http://a.com', { method: 'get' }), {
				method: 'post',
			}),
		).resolves;
	});

	it('match using custom function with Request with unusual options', async () => {
		// as node-fetch does not try to emulate all the WHATWG standards, we can't check for the
		// same properties in the browser and nodejs
		const propertyToCheck = new Request('http://example.com').cache
			? 'credentials'
			: 'compress';
		const valueToSet = propertyToCheck === 'credentials' ? 'include' : false;

		const fm = fetchMock.createInstance();
		fm.route(({ request }) => request[propertyToCheck] === valueToSet, 200);

		await expect(
			fm.fetchHandler(new Request('http://a.com/logged-in')),
		).rejects.toThrow();
		expect(
			fm.fetchHandler(
				new Request('http://a.com/logged-in', {
					[propertyToCheck]: valueToSet,
				}),
			),
		).resolves.not.toThrow();
	});
});
describe('user defined matchers', () => {
	it('match on sync property', async () => {
		const fm = fetchMock.createInstance();
		fm.defineMatcher({
			name: 'syncMatcher',
			matcher:
				(route) =>
				({ url }) =>
					url.indexOf(route.syncMatcher) > -1,
		});
		fm.route(
			{
				syncMatcher: 'a',
			},
			200,
		).catch(404);
		const miss = await fm.fetchHandler('http://b.com');
		expect(miss.status).toEqual(404);
		const hit = await fm.fetchHandler('http://a.com');
		expect(hit.status).toEqual(200);
	});

	it('match on async body property', async () => {
		const fm = fetchMock.createInstance();
		fm.defineMatcher({
			name: 'bodyMatcher',
			matcher:
				(route) =>
				({ options }) =>
					JSON.parse(options.body)[route.bodyMatcher] === true,
			usesBody: true,
		});
		fm.route(
			{
				bodyMatcher: 'a',
			},
			200,
		).catch(404);
		const miss = await fm.fetchHandler(
			new fm.config.Request('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ b: true }),
			}),
		);
		expect(miss.status).toEqual(404);
		const hit1 = await fm.fetchHandler(
			new fm.config.Request('http://a.com', {
				method: 'POST',
				body: JSON.stringify({ a: true }),
			}),
		);
		expect(hit1.status).toEqual(200);
		const hit2 = await fm.fetchHandler('http://a.com', {
			method: 'POST',
			body: JSON.stringify({ a: true }),
		});
		expect(hit2.status).toEqual(200);
	});

	// TODO This test hangs
	// Need to decide what the actual behaviour should be when trying to access body
	// prematurely - should it throw early somehow when options.body is accessed?
	it.skip('not match on async body property without passing `usesBody: true`', async () => {
		const fm = fetchMock.createInstance();
		fm.defineMatcher({
			name: 'asyncBodyMatcher',
			matcher:
				(route) =>
				({ options }) =>
					JSON.parse(options.body)[route.asyncBodyMatcher] === true,
		});
		fm.route(
			{
				asyncBodyMatcher: 'a',
			},
			200,
		);
		await expect(
			fm.fetchHandler(
				new fm.config.Request('http://a.com', {
					method: 'POST',
					body: JSON.stringify({ a: true }),
				}),
			),
		).rejects.toThrow();
	});
});

describe('making query strings available', () => {
	it('makes  query string values available to matchers', async () => {
		const fm = fetchMock.createInstance();
		fm.route(
			{ query: { a: ['a-val1', 'a-val2'], b: 'b-val', c: undefined } },
			200,
		);
		const response = await fm.fetchHandler(
			'http://a.com?a=a-val1&a=a-val2&b=b-val&c=',
		);
		expect(response.status).toEqual(200);
	});

	it('always writes query string values to the callLog when using a URL', async () => {
		const fm = fetchMock.createInstance();
		fm.route(
			{ query: { a: ['a-val1', 'a-val2'], b: 'b-val', c: undefined } },
			200,
		);
		const url = new URL('http://a.com/');
		url.searchParams.append('a', 'a-val1');
		url.searchParams.append('a', 'a-val2');
		url.searchParams.append('b', 'b-val');
		url.searchParams.append('c', undefined);
		const response = await fm.fetchHandler(
			'http://a.com?a=a-val1&a=a-val2&b=b-val&c=',
		);
		expect(response.status).toEqual(200);
	});

	it('always writes query string values to the callLog when using a Request', async () => {
		const fm = fetchMock.createInstance();
		fm.route(
			{ query: { a: ['a-val1', 'a-val2'], b: 'b-val', c: undefined } },
			200,
		);
		const response = await fm.fetchHandler(
			new Request('http://a.com?a=a-val1&a=a-val2&b=b-val&c='),
		);
		expect(response.status).toEqual(200);
	});
});
describe.skip('random integration tests', () => {
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
	//         it('not convert if `redirectUrl` property exists', async () => {
	//             fm.route('*', {
	//                 redirectUrl: 'http://url.to.hit',
	//             });
	//             const res = await fm.fetchHandler('http://a.com/');
	//             expect(res.headers.get('content-type')).toBeNull();
	//         });
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
	//         // See http://github.com/wheresrhys/fetch-mock/issues/575
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
});
