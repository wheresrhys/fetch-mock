import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import fetchMock from '../../FetchMock.js'

describe('mock and spy', () => {
	let fm;
	const nativeFetch = globalThis.fetch;
	beforeEach(() => {
		fm = fetchMock.createInstance()
	})
	afterEach(() => {
		globalThis.fetch = nativeFetch;
	})

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

	describe('.mockGlobal()', () => {
		testChainableMethod('mockGlobal')
		testChainableMethod('restoreGlobal')
		it('replaces global fetch with fetchMock.fetchHandler', () => {
			fm.mockGlobal()
			expect(globalThis.fetch).toEqual(fm.fetchHandler)
		})

		it('calls to fetch are successfully handled by fetchMock.fetchHandler', async () => {
			fm.mockGlobal()
				.catch(200);
			const response = await fetch('https://a.com', {method: 'post'});
			expect(response.status).toEqual(200);
			const callLog = fm.callHistory.lastCall();
			expect(callLog.args).toEqual( [ 'https://a.com/', { method: 'post' } ])
		})

		it('restores global fetch', () => {
			fm.mockGlobal().restoreGlobal();
			expect(globalThis.fetch).toEqual(nativeFetch)
		})

	})
	describe('.spy()', () => {
		testChainableMethod('spyGlobal')
		it('passes all requests through to the network by default', () => {})
		it('falls through to global fetch for a specific route', () => {

		})

		it('can apply the full range of matchers and route options', () => {

		})

		it('can name a route', () => {

		})

		it('plays nice with mockGlobal()', () => {})
		// 	vi.spyOn(globalThis, 'fetch')
		// 	fm.spyGlobal()
		// 	try {
		// 		await fetch('https://a.com', {method: 'post'});
		// 	} catch (err) {}
		// 	expect(globalThis.fetch).toHaveBeenCalledWith('https://a.com', {method: 'post'})
		// 	const callLog = fm.callHistory.lastCall();
		// 	expect(callLog.args).toEqual( [ 'https://a.com/', { method: 'post' } ])
		// 	globalThis.fetch.restore()
		// })

		// it('restores global fetch', () => {
		// 	fm.spyGlobal().restoreGlobal();
		// 	expect(globalThis.fetch).toEqual(nativeFetch)
		// })
	})


})
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






// import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// const { fetchMock } = testGlobals;

// describe('use with global fetch', () => {
// 	let originalFetch;

// 	const expectToBeStubbed = (yes = true) => {
// 		expect(globalThis.fetch).toEqual(
// 			yes ? fetchMock.fetchHandler : originalFetch,
// 		);
// 		expect(globalThis.fetch).not.toEqual(
// 			yes ? originalFetch : fetchMock.fetchHandler,
// 		);
// 	};

// 	beforeEach(() => {
// 		originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
// 	});
// 	afterEach(fetchMock.restore);

// 	it('replaces global fetch when mock called', () => {
// 		fetchMock.mock('*', 200);
// 		expectToBeStubbed();
// 	});

// 	it('replaces global fetch when catch called', () => {
// 		fetchMock.catch(200);
// 		expectToBeStubbed();
// 	});

// 	it('replaces global fetch when spy called', () => {
// 		fetchMock.spy();
// 		expectToBeStubbed();
// 	});

// 	it('restores global fetch after a mock', () => {
// 		fetchMock.mock('*', 200).restore();
// 		expectToBeStubbed(false);
// 	});

// 	it('restores global fetch after a complex mock', () => {
// 		fetchMock.mock('a', 200).mock('b', 200).spy().catch(404).restore();
// 		expectToBeStubbed(false);
// 	});

// 	it('not call default fetch when in mocked mode', async () => {
// 		fetchMock.mock('*', 200);

// 		await globalThis.fetch('http://a.com');
// 		expect(originalFetch).not.toHaveBeenCalled();
// 	});
// });
// let originalFetch;

// beforeAll(() => {
// 	originalFetch = globalThis.fetch = vi.fn().mockResolvedValue('dummy');
// });

// it('return function', () => {
// 	const sbx = fetchMock.sandbox();
// 	expect(typeof sbx).toEqual('function');
// });



// it("don't interfere with global fetch", () => {
// 	const sbx = fetchMock.sandbox().route('http://a.com', 200);

// 	expect(globalThis.fetch).toEqual(originalFetch);
// 	expect(globalThis.fetch).not.toEqual(sbx);
// });

// it("don't interfere with global fetch-mock", async () => {
// 	const sbx = fetchMock.sandbox().route('http://a.com', 200).catch(302);

// 	fetchMock.route('http://b.com', 200).catch(301);

// 	expect(globalThis.fetch).toEqual(fetchMock.fetchHandler);
// 	expect(fetchMock.fetchHandler).not.toEqual(sbx);
// 	expect(fetchMock.fallbackResponse).not.toEqual(sbx.fallbackResponse);
// 	expect(fetchMock.routes).not.toEqual(sbx.routes);

// 	const [sandboxed, globally] = await Promise.all([
// 		sbx('http://a.com'),
// 		fetch('http://b.com'),
// 	]);

// 	expect(sandboxed.status).toEqual(200);
// 	expect(globally.status).toEqual(200);
// 	expect(sbx.called('http://a.com')).toBe(true);
// 	expect(sbx.called('http://b.com')).toBe(false);
// 	expect(fetchMock.called('http://b.com')).toBe(true);
// 	expect(fetchMock.called('http://a.com')).toBe(false);
// 	expect(sbx.called('http://a.com')).toBe(true);
// 	fetchMock.restore();
// });

// describe('global mocking', () => {
// 	let originalFetch;
// 	beforeAll(() => {
// 		originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
// 	});
// 	afterEach(() => fetchMock.restore({ sticky: true }));

// 	it('global mocking resists resetBehavior calls', () => {
// 		fetchMock.route('*', 200, { sticky: true }).resetBehavior();
// 		expect(globalThis.fetch).not.toEqual(originalFetch);
// 	});

// 	it('global mocking does not resist resetBehavior calls when sent `sticky: true`', () => {
// 		fetchMock
// 			.route('*', 200, { sticky: true })
// 			.resetBehavior({ sticky: true });
// 		expect(globalThis.fetch).toEqual(originalFetch);
// 	});
// });

// describe('sandboxes', () => {
// 	it('sandboxed instances should inherit stickiness', () => {
// 		const sbx1 = fetchMock
// 			.sandbox()
// 			.route('*', 200, { sticky: true })
// 			.catch(300);

// 		const sbx2 = sbx1.sandbox().resetBehavior();

// 		expect(sbx1.routes.length).toEqual(1);
// 		expect(sbx2.routes.length).toEqual(1);

// 		sbx2.resetBehavior({ sticky: true });

// 		expect(sbx1.routes.length).toEqual(1);
// 		expect(sbx2.routes.length).toEqual(0);
// 	});
// });

// import {
// 	afterEach,
// 	beforeEach,
// 	describe,
// 	expect,
// 	it,
// 	beforeAll,
// 	vi,
// } from 'vitest';

// const { fetchMock } = testGlobals;
// describe('Set up and tear down', () => {
// 	let fm;
// 	beforeAll(() => {
// 		fm = fetchMock.createInstance();
// 		fm.config.warnOnUnmatched = false;
// 	});
// 	afterEach(() => fm.restore());

// 	const testChainableMethod = (method, ...args) => {
// 		it(`${method}() is chainable`, () => {
// 			expect(fm[method](...args)).toEqual(fm);
// 		});

// 		it(`${method}() has "this"`, () => {
// 			vi.spyOn(fm, method).mockReturnThis();
// 			expect(fm[method](...args)).toBe(fm);
// 			fm[method].mockRestore();
// 		});
// 	};

// 	describe('mock', () => {
// 		testChainableMethod('mock', '*', 200);

// 		it('can be called multiple times', () => {
// 			expect(() => {
// 				fm.mock('http://a.com', 200).mock('http://b.com', 200);
// 			}).not.toThrow();
// 		});

// 		it('can be called after fetchMock is restored', () => {
// 			expect(() => {
// 				fm.mock('*', 200).restore().mock('*', 200);
// 			}).not.toThrow();
// 		});

// 		describe('parameters', () => {
// 			beforeEach(() => {
// 				vi.spyOn(fm, 'compileRoute');
// 				vi.spyOn(fm, '_mock').mockReturnValue(fm);
// 			});

// 			afterEach(() => {
// 				fm.compileRoute.mockRestore();
// 				fm._mock.mockRestore();
// 			});

// 			it('accepts single config object', () => {
// 				const config = {
// 					url: '*',
// 					response: 200,
// 				};
// 				expect(() => fm.mock(config)).not.toThrow();
// 				expect(fm.compileRoute).toHaveBeenCalledWith([config]);
// 				expect(fm._mock).toHaveBeenCalled();
// 			});

// 			it('accepts matcher, route pairs', () => {
// 				expect(() => fm.mock('*', 200)).not.toThrow();
// 				expect(fm.compileRoute).toHaveBeenCalledWith(['*', 200]);
// 				expect(fm._mock).toHaveBeenCalled();
// 			});

// 			it('accepts matcher, response, config triples', () => {
// 				expect(() =>
// 					fm.mock('*', 'ok', {
// 						method: 'PUT',
// 						some: 'prop',
// 					}),
// 				).not.toThrow();
// 				expect(fm.compileRoute).toHaveBeenCalledWith([
// 					'*',
// 					'ok',
// 					{
// 						method: 'PUT',
// 						some: 'prop',
// 					},
// 				]);
// 				expect(fm._mock).toHaveBeenCalled();
// 			});

// 			it('expects a matcher', () => {
// 				expect(() => fm.mock(null, 'ok')).toThrow();
// 			});

// 			it('expects a response', () => {
// 				expect(() => fm.mock('*')).toThrow();
// 			});

// 			it('can be called with no parameters', () => {
// 				expect(() => fm.mock()).not.toThrow();
// 				expect(fm.compileRoute).not.toHaveBeenCalled();
// 				expect(fm._mock).toHaveBeenCalled();
// 			});

// 			it('should accept object responses when also passing options', () => {
// 				expect(() =>
// 					fm.mock('*', { foo: 'bar' }, { method: 'GET' }),
// 				).not.toThrow();
// 			});
// 		});
// 	});

// 	describe('reset', () => {
// 		testChainableMethod('reset');

// 		it('can be called even if no mocks set', () => {
// 			expect(() => fm.restore()).not.toThrow();
// 		});

// 		it('calls resetHistory', () => {
// 			vi.spyOn(fm, 'resetHistory');
// 			fm.restore();
// 			expect(fm.resetHistory).toHaveBeenCalledTimes(1);
// 			fm.resetHistory.mockRestore();
// 		});

// 		it('removes all routing', () => {
// 			fm.mock('*', 200).catch(200);

// 			expect(fm.routes.length).toEqual(1);
// 			expect(fm.fallbackResponse).toBeDefined();

// 			fm.restore();

// 			expect(fm.routes.length).toEqual(0);
// 			expect(fm.fallbackResponse).toBeUndefined();
// 		});

// 		it('restore is an alias for reset', () => {
// 			expect(fm.restore).toEqual(fm.reset);
// 		});
// 	});


// 	describe('spy', () => {
// 		testChainableMethod('spy');

// 		it('calls catch()', () => {
// 			vi.spyOn(fm, 'catch');
// 			fm.spy();
// 			expect(fm.catch).toHaveBeenCalledTimes(1);
// 			fm.catch.mockRestore();
// 		});
// 	});
// });


// import { describe, expect, it, vi } from 'vitest';

// const { fetchMock } = testGlobals;
// describe('spy()', () => {
// 	it('when mocking globally, spy falls through to global fetch', async () => {
// 		const originalFetch = globalThis.fetch;
// 		const fetchSpy = vi.fn().mockResolvedValue('example');

// 		globalThis.fetch = fetchSpy;

// 		fetchMock.spy();

// 		await globalThis.fetch('http://a.com/', { method: 'get' });
// 		expect(fetchSpy).toHaveBeenCalledWith(
// 			'http://a.com/',
// 			{ method: 'get' },
// 			undefined,
// 		);
// 		fetchMock.restore();
// 		globalThis.fetch = originalFetch;
// 	});

// 	it('when mocking locally, spy falls through to configured fetch', async () => {
// 		const fetchSpy = vi.fn().mockResolvedValue('dummy');

// 		const fm = fetchMock.sandbox();
// 		fm.config.fetch = fetchSpy;

// 		fm.spy();
// 		await fm.fetchHandler('http://a.com/', { method: 'get' });
// 		expect(fetchSpy).toHaveBeenCalledWith(
// 			'http://a.com/',
// 			{ method: 'get' },
// 			undefined,
// 		);
// 		fm.restore();
// 	});

// 	it('can restrict spying to a route', async () => {
// 		const fetchSpy = vi.fn().mockResolvedValue('dummy');

// 		const fm = fetchMock.sandbox();
// 		fm.config.fetch = fetchSpy;

// 		fm.spy({ url: 'http://a.com/', method: 'get' });
// 		await fm.fetchHandler('http://a.com/', { method: 'get' });
// 		expect(fetchSpy).toHaveBeenCalledWith(
// 			'http://a.com/',
// 			{ method: 'get' },
// 			undefined,
// 		);

// 		expect(() => fm.fetchHandler('http://b.com/', { method: 'get' })).toThrow();
// 		expect(() =>
// 			fm.fetchHandler('http://a.com/', { method: 'post' }),
// 		).toThrow();
// 		fm.restore();
// 	});
// });


// it('error if spy() is called and no fetch defined in config', () => {
// 	const fm = fetchMock.sandbox();
// 	delete fm.config.fetch;
// 	expect(() => fm.spy()).toThrow();
// });

// it("don't error if spy() is called and fetch defined in config", () => {
// 	const fm = fetchMock.sandbox();
// 	fm.config.fetch = originalFetch;
// 	expect(() => fm.spy()).not.toThrow();
// });

// it('exports a properly mocked node-fetch module shape', () => {
// 	// uses node-fetch default require pattern
// 	const {
// 		default: fetch,
// 		Headers,
// 		Request,
// 		Response,
// 	} = fetchMock.sandbox();

// 	expect(fetch.name).toEqual('fetchMockProxy');
// 	expect(new Headers()).toBeInstanceOf(fetchMock.config.Headers);
// 	expect(new Request('http://a.com')).toBeInstanceOf(
// 		fetchMock.config.Request,
// 	);
// 	expect(new Response()).toBeInstanceOf(fetchMock.config.Response);
// });


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
