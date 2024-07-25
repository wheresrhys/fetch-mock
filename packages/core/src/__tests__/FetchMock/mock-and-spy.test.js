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






import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchMock } = testGlobals;

describe('use with global fetch', () => {
	let originalFetch;

	const expectToBeStubbed = (yes = true) => {
		expect(globalThis.fetch).toEqual(
			yes ? fetchMock.fetchHandler : originalFetch,
		);
		expect(globalThis.fetch).not.toEqual(
			yes ? originalFetch : fetchMock.fetchHandler,
		);
	};

	beforeEach(() => {
		originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
	});
	afterEach(fetchMock.restore);

	it('replaces global fetch when mock called', () => {
		fetchMock.mock('*', 200);
		expectToBeStubbed();
	});

	it('replaces global fetch when catch called', () => {
		fetchMock.catch(200);
		expectToBeStubbed();
	});

	it('replaces global fetch when spy called', () => {
		fetchMock.spy();
		expectToBeStubbed();
	});

	it('restores global fetch after a mock', () => {
		fetchMock.mock('*', 200).restore();
		expectToBeStubbed(false);
	});

	it('restores global fetch after a complex mock', () => {
		fetchMock.mock('a', 200).mock('b', 200).spy().catch(404).restore();
		expectToBeStubbed(false);
	});

	it('not call default fetch when in mocked mode', async () => {
		fetchMock.mock('*', 200);

		await globalThis.fetch('http://a.com');
		expect(originalFetch).not.toHaveBeenCalled();
	});
});
let originalFetch;

beforeAll(() => {
	originalFetch = globalThis.fetch = vi.fn().mockResolvedValue('dummy');
});

it('return function', () => {
	const sbx = fetchMock.sandbox();
	expect(typeof sbx).toEqual('function');
});



it("don't interfere with global fetch", () => {
	const sbx = fetchMock.sandbox().route('http://a.com', 200);

	expect(globalThis.fetch).toEqual(originalFetch);
	expect(globalThis.fetch).not.toEqual(sbx);
});

it("don't interfere with global fetch-mock", async () => {
	const sbx = fetchMock.sandbox().route('http://a.com', 200).catch(302);

	fetchMock.route('http://b.com', 200).catch(301);

	expect(globalThis.fetch).toEqual(fetchMock.fetchHandler);
	expect(fetchMock.fetchHandler).not.toEqual(sbx);
	expect(fetchMock.fallbackResponse).not.toEqual(sbx.fallbackResponse);
	expect(fetchMock.routes).not.toEqual(sbx.routes);

	const [sandboxed, globally] = await Promise.all([
		sbx('http://a.com'),
		fetch('http://b.com'),
	]);

	expect(sandboxed.status).toEqual(200);
	expect(globally.status).toEqual(200);
	expect(sbx.called('http://a.com')).toBe(true);
	expect(sbx.called('http://b.com')).toBe(false);
	expect(fetchMock.called('http://b.com')).toBe(true);
	expect(fetchMock.called('http://a.com')).toBe(false);
	expect(sbx.called('http://a.com')).toBe(true);
	fetchMock.restore();
});

describe('global mocking', () => {
	let originalFetch;
	beforeAll(() => {
		originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
	});
	afterEach(() => fetchMock.restore({ sticky: true }));

	it('global mocking resists resetBehavior calls', () => {
		fetchMock.route('*', 200, { sticky: true }).resetBehavior();
		expect(globalThis.fetch).not.toEqual(originalFetch);
	});

	it('global mocking does not resist resetBehavior calls when sent `sticky: true`', () => {
		fetchMock
			.route('*', 200, { sticky: true })
			.resetBehavior({ sticky: true });
		expect(globalThis.fetch).toEqual(originalFetch);
	});
});

describe('sandboxes', () => {
	it('sandboxed instances should inherit stickiness', () => {
		const sbx1 = fetchMock
			.sandbox()
			.route('*', 200, { sticky: true })
			.catch(300);

		const sbx2 = sbx1.sandbox().resetBehavior();

		expect(sbx1.routes.length).toEqual(1);
		expect(sbx2.routes.length).toEqual(1);

		sbx2.resetBehavior({ sticky: true });

		expect(sbx1.routes.length).toEqual(1);
		expect(sbx2.routes.length).toEqual(0);
	});
});

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	beforeAll,
	vi,
} from 'vitest';

const { fetchMock } = testGlobals;
describe('Set up and tear down', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});
	afterEach(() => fm.restore());

	const testChainableMethod = (method, ...args) => {
		it(`${method}() is chainable`, () => {
			expect(fm[method](...args)).toEqual(fm);
		});

		it(`${method}() has "this"`, () => {
			vi.spyOn(fm, method).mockReturnThis();
			expect(fm[method](...args)).toBe(fm);
			fm[method].mockRestore();
		});
	};

	describe('mock', () => {
		testChainableMethod('mock', '*', 200);

		it('can be called multiple times', () => {
			expect(() => {
				fm.mock('http://a.com', 200).mock('http://b.com', 200);
			}).not.toThrow();
		});

		it('can be called after fetchMock is restored', () => {
			expect(() => {
				fm.mock('*', 200).restore().mock('*', 200);
			}).not.toThrow();
		});

		describe('parameters', () => {
			beforeEach(() => {
				vi.spyOn(fm, 'compileRoute');
				vi.spyOn(fm, '_mock').mockReturnValue(fm);
			});

			afterEach(() => {
				fm.compileRoute.mockRestore();
				fm._mock.mockRestore();
			});

			it('accepts single config object', () => {
				const config = {
					url: '*',
					response: 200,
				};
				expect(() => fm.mock(config)).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith([config]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('accepts matcher, route pairs', () => {
				expect(() => fm.mock('*', 200)).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith(['*', 200]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('accepts matcher, response, config triples', () => {
				expect(() =>
					fm.mock('*', 'ok', {
						method: 'PUT',
						some: 'prop',
					}),
				).not.toThrow();
				expect(fm.compileRoute).toHaveBeenCalledWith([
					'*',
					'ok',
					{
						method: 'PUT',
						some: 'prop',
					},
				]);
				expect(fm._mock).toHaveBeenCalled();
			});

			it('expects a matcher', () => {
				expect(() => fm.mock(null, 'ok')).toThrow();
			});

			it('expects a response', () => {
				expect(() => fm.mock('*')).toThrow();
			});

			it('can be called with no parameters', () => {
				expect(() => fm.mock()).not.toThrow();
				expect(fm.compileRoute).not.toHaveBeenCalled();
				expect(fm._mock).toHaveBeenCalled();
			});

			it('should accept object responses when also passing options', () => {
				expect(() =>
					fm.mock('*', { foo: 'bar' }, { method: 'GET' }),
				).not.toThrow();
			});
		});
	});

	describe('reset', () => {
		testChainableMethod('reset');

		it('can be called even if no mocks set', () => {
			expect(() => fm.restore()).not.toThrow();
		});

		it('calls resetHistory', () => {
			vi.spyOn(fm, 'resetHistory');
			fm.restore();
			expect(fm.resetHistory).toHaveBeenCalledTimes(1);
			fm.resetHistory.mockRestore();
		});

		it('removes all routing', () => {
			fm.mock('*', 200).catch(200);

			expect(fm.routes.length).toEqual(1);
			expect(fm.fallbackResponse).toBeDefined();

			fm.restore();

			expect(fm.routes.length).toEqual(0);
			expect(fm.fallbackResponse).toBeUndefined();
		});

		it('restore is an alias for reset', () => {
			expect(fm.restore).toEqual(fm.reset);
		});
	});

	describe('resetBehavior', () => {
		testChainableMethod('resetBehavior');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetBehavior()).not.toThrow();
		});

		it('removes all routing', () => {
			fm.mock('*', 200).catch(200);

			expect(fm.routes.length).toEqual(1);
			expect(fm.fallbackResponse).toBeDefined();

			fm.resetBehavior();

			expect(fm.routes.length).toEqual(0);
			expect(fm.fallbackResponse).toBeUndefined();
		});
	});

	describe('resetHistory', () => {
		testChainableMethod('resetHistory');

		it('can be called even if no mocks set', () => {
			expect(() => fm.resetHistory()).not.toThrow();
		});

		it('resets call history', async () => {
			fm.mock('*', 200).catch(200);
			await fm.fetchHandler('a');
			await fm.fetchHandler('b');
			expect(fm.called()).toBe(true);

			fm.resetHistory();
			expect(fm.called()).toBe(false);
			expect(fm.called('*')).toBe(false);
			expect(fm.calls('*').length).toEqual(0);
			expect(fm.calls(true).length).toEqual(0);
			expect(fm.calls(false).length).toEqual(0);
			expect(fm.calls().length).toEqual(0);
		});
	});

	describe('spy', () => {
		testChainableMethod('spy');

		it('calls catch()', () => {
			vi.spyOn(fm, 'catch');
			fm.spy();
			expect(fm.catch).toHaveBeenCalledTimes(1);
			fm.catch.mockRestore();
		});
	});
});


import { describe, expect, it, vi } from 'vitest';

const { fetchMock } = testGlobals;
describe('spy()', () => {
	it('when mocking globally, spy falls through to global fetch', async () => {
		const originalFetch = globalThis.fetch;
		const fetchSpy = vi.fn().mockResolvedValue('example');

		globalThis.fetch = fetchSpy;

		fetchMock.spy();

		await globalThis.fetch('http://a.com/', { method: 'get' });
		expect(fetchSpy).toHaveBeenCalledWith(
			'http://a.com/',
			{ method: 'get' },
			undefined,
		);
		fetchMock.restore();
		globalThis.fetch = originalFetch;
	});

	it('when mocking locally, spy falls through to configured fetch', async () => {
		const fetchSpy = vi.fn().mockResolvedValue('dummy');

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy();
		await fm.fetchHandler('http://a.com/', { method: 'get' });
		expect(fetchSpy).toHaveBeenCalledWith(
			'http://a.com/',
			{ method: 'get' },
			undefined,
		);
		fm.restore();
	});

	it('can restrict spying to a route', async () => {
		const fetchSpy = vi.fn().mockResolvedValue('dummy');

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy({ url: 'http://a.com/', method: 'get' });
		await fm.fetchHandler('http://a.com/', { method: 'get' });
		expect(fetchSpy).toHaveBeenCalledWith(
			'http://a.com/',
			{ method: 'get' },
			undefined,
		);

		expect(() => fm.fetchHandler('http://b.com/', { method: 'get' })).toThrow();
		expect(() =>
			fm.fetchHandler('http://a.com/', { method: 'post' }),
		).toThrow();
		fm.restore();
	});
});


it('error if spy() is called and no fetch defined in config', () => {
	const fm = fetchMock.sandbox();
	delete fm.config.fetch;
	expect(() => fm.spy()).toThrow();
});

it("don't error if spy() is called and fetch defined in config", () => {
	const fm = fetchMock.sandbox();
	fm.config.fetch = originalFetch;
	expect(() => fm.spy()).not.toThrow();
});

it('exports a properly mocked node-fetch module shape', () => {
	// uses node-fetch default require pattern
	const {
		default: fetch,
		Headers,
		Request,
		Response,
	} = fetchMock.sandbox();

	expect(fetch.name).toEqual('fetchMockProxy');
	expect(new Headers()).toBeInstanceOf(fetchMock.config.Headers);
	expect(new Request('http://a.com')).toBeInstanceOf(
		fetchMock.config.Request,
	);
	expect(new Response()).toBeInstanceOf(fetchMock.config.Response);
});
