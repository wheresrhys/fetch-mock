import { afterEach, describe, expect, it, beforeAll, vi } from 'vitest';

import fetchMock from '../../src/index.js';

describe('sticky routes', () => {
	describe('effect on routes', () => {
		let fm;
		beforeAll(() => {
			fm = fetchMock.createInstance();
			fm.config.warnOnUnmatched = false;
		});

		afterEach(() => fm.restore({ sticky: true }));

		describe('resetting behaviour', () => {
			it('behaviour resists resetBehavior calls', () => {
				fm.mock('*', 200, { sticky: true }).resetBehavior();
				expect(fm.routes.length).toEqual(1);
			});

			it('behaviour resists restore calls', () => {
				fm.mock('*', 200, { sticky: true }).restore();
				expect(fm.routes.length).toEqual(1);
			});

			it('behaviour resists reset calls', () => {
				fm.mock('*', 200, { sticky: true }).reset();
				expect(fm.routes.length).toEqual(1);
			});

			it('behaviour does not resist resetBehavior calls when sent `sticky: true`', () => {
				fm.mock('*', 200, { sticky: true }).resetBehavior({ sticky: true });
				expect(fm.routes.length).toEqual(0);
			});

			it('behaviour does not resist restore calls when sent `sticky: true`', () => {
				fm.mock('*', 200, { sticky: true }).restore({ sticky: true });
				expect(fm.routes.length).toEqual(0);
			});

			it('behaviour does not resist reset calls when sent `sticky: true`', () => {
				fm.mock('*', 200, { sticky: true }).reset({ sticky: true });
				expect(fm.routes.length).toEqual(0);
			});
		});

		describe('resetting history', () => {
			it('history does not resist resetHistory calls', () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.resetHistory();
				expect(fm.called()).toBe(false);
			});

			it('history does not resist restore calls', () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.restore();
				expect(fm.called()).toBe(false);
			});

			it('history does not resist reset calls', () => {
				fm.mock('*', 200, { sticky: true });
				fm.fetchHandler('http://a.com');
				fm.reset();
				expect(fm.called()).toBe(false);
			});
		});

		describe('multiple routes', () => {
			it('can have multiple sticky routes', () => {
				fm.mock('*', 200, { sticky: true })
					.mock('http://a.com', 200, { sticky: true })
					.resetBehavior();
				expect(fm.routes.length).toEqual(2);
			});

			it('can have a sticky route before non-sticky routes', () => {
				fm.mock('*', 200, { sticky: true })
					.mock('http://a.com', 200)
					.resetBehavior();
				expect(fm.routes.length).toEqual(1);
				expect(fm.routes[0].url).toEqual('*');
			});

			it('can have a sticky route after non-sticky routes', () => {
				fm.mock('*', 200)
					.mock('http://a.com', 200, { sticky: true })
					.resetBehavior();
				expect(fm.routes.length).toEqual(1);
				expect(fm.routes[0].url).toEqual('http://a.com');
			});
		});
	});
	describe('global mocking', () => {
		let originalFetch;
		beforeAll(() => {
			originalFetch = globalThis.fetch = vi.fn().mockResolvedValue();
		});
		afterEach(() => fetchMock.restore({ sticky: true }));

		it('global mocking resists resetBehavior calls', () => {
			fetchMock.mock('*', 200, { sticky: true }).resetBehavior();
			expect(globalThis.fetch).not.toEqual(originalFetch);
		});

		it('global mocking does not resist resetBehavior calls when sent `sticky: true`', () => {
			fetchMock
				.mock('*', 200, { sticky: true })
				.resetBehavior({ sticky: true });
			expect(globalThis.fetch).toEqual(originalFetch);
		});
	});

	describe('sandboxes', () => {
		it('sandboxed instances should inherit stickiness', () => {
			const sbx1 = fetchMock
				.sandbox()
				.mock('*', 200, { sticky: true })
				.catch(300);

			const sbx2 = sbx1.sandbox().resetBehavior();

			expect(sbx1.routes.length).toEqual(1);
			expect(sbx2.routes.length).toEqual(1);

			sbx2.resetBehavior({ sticky: true });

			expect(sbx1.routes.length).toEqual(1);
			expect(sbx2.routes.length).toEqual(0);
		});
	});
});
