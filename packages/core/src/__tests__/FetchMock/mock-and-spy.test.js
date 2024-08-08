import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import fetchMock from '../../FetchMock';

describe('mock and spy', () => {
	let fm;
	const nativeFetch = globalThis.fetch;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	afterEach(() => {
		globalThis.fetch = nativeFetch;
	});

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
		testChainableMethod('mockGlobal');
		testChainableMethod('unmockGlobal');

		it('replaces global fetch with fetchMock.fetchHandler', async () => {
			vi.spyOn(fm, 'fetchHandler');
			fm.mockGlobal();
			try {
				await fetch('http://a.com', { method: 'post' });
			} catch (err) {}
			// cannot just check globalThis.fetch === fm.fetchHandler because we apply .bind() to fetchHandler
			expect(fm.fetchHandler).toHaveBeenCalledWith('http://a.com', {
				method: 'post',
			});
		});

		it('calls to fetch are successfully handled by fetchMock.fetchHandler', async () => {
			fm.mockGlobal().catch(200);
			const response = await fetch('http://a.com', { method: 'post' });
			expect(response.status).toEqual(200);
			const callLog = fm.callHistory.lastCall();
			expect(callLog.args).toEqual(['http://a.com', { method: 'post' }]);
		});

		it('restores global fetch', () => {
			fm.mockGlobal().unmockGlobal();
			expect(globalThis.fetch).toEqual(nativeFetch);
		});
	});
	describe('.spy()', () => {
		testChainableMethod('spy');
		testChainableMethod('spyGlobal');
		it('passes all requests through to the network by default', async () => {
			vi.spyOn(fm.config, 'fetch');
			fm.spy();
			try {
				await fm.fetchHandler('http://a.com/', { method: 'post' });
			} catch (err) {}
			expect(fm.config.fetch).toHaveBeenCalledWith('http://a.com/', {
				method: 'post',
			});
			fm.config.fetch.mockRestore();
		});
		it('falls through to network for a specific route', async () => {
			vi.spyOn(fm.config, 'fetch');
			fm.spy('http://a.com').route('http://b.com', 200);
			try {
				await fm.fetchHandler('http://a.com/', { method: 'post' });
				await fm.fetchHandler('http://b.com/', { method: 'post' });
			} catch (err) {}

			expect(fm.config.fetch).toHaveBeenCalledTimes(1);
			expect(fm.config.fetch).toHaveBeenCalledWith('http://a.com/', {
				method: 'post',
			});
			fm.config.fetch.mockRestore();
		});

		it('can apply the full range of matchers and route options', async () => {
			vi.spyOn(fm.config, 'fetch');
			fm.spy({ method: 'delete', headers: { check: 'this' } }).catch();
			try {
				await fm.fetchHandler('http://a.com/');
				await fm.fetchHandler('http://a.com/', {
					method: 'delete',
					headers: { check: 'this' },
				});
			} catch (err) {}
			expect(fm.config.fetch).toHaveBeenCalledTimes(1);
			expect(fm.config.fetch).toHaveBeenCalledWith('http://a.com/', {
				method: 'delete',
				headers: { check: 'this' },
			});
			fm.config.fetch.mockRestore();
		});

		it('can name a route', async () => {
			fm.spy('http://a.com/', 'myroute').catch();
			try {
				await fm.fetchHandler('http://a.com/');
			} catch (err) {}
			expect(fm.callHistory.called('myroute')).toBe(true);
		});

		it('plays nice with mockGlobal()', async () => {
			globalThis.fetch = fm.config.fetch = vi.fn();
			fm.mockGlobal().spy('http://a.com', 200);
			try {
				await fm.fetchHandler('http://a.com/', { method: 'post' });
			} catch (err) {}
			expect(fm.config.fetch).toHaveBeenCalledTimes(1);
			expect(fm.config.fetch).toHaveBeenCalledWith('http://a.com/', {
				method: 'post',
			});
		});

		it('has spyGlobal() shorthand', async () => {
			globalThis.fetch = fm.config.fetch = vi.fn();
			fm.spyGlobal();
			try {
				await fm.fetchHandler('http://a.com/', { method: 'post' });
			} catch (err) {}
			expect(fm.config.fetch).toHaveBeenCalledTimes(1);
			expect(fm.config.fetch).toHaveBeenCalledWith('http://a.com/', {
				method: 'post',
			});
		});
	});
});
