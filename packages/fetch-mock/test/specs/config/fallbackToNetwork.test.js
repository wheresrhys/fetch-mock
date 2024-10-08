import { beforeEach, describe, expect, it } from 'vitest';

import fetchMock from '../../../src/index.js';

describe('fallbackToNetwork', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	it('error by default', () => {
		expect(() => fm.fetchHandler('http://unmocked.com')).toThrow();
	});

	it('not error when configured globally', () => {
		globalThis.fetch = async () => ({ status: 202 });
		fm.config.fallbackToNetwork = true;
		fm.mock('http://mocked.com', 201);
		expect(() => fm.fetchHandler('http://unmocked.com')).not.toThrow();
		delete globalThis.fetch;
	});

	it('actually falls back to network when configured globally', async () => {
		globalThis.fetch = async () => ({ status: 202 });
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
		sbx.config.fetch = async () => ({ status: 202 });
		sbx.config.fallbackToNetwork = true;
		sbx.mock('http://mocked.com', 201);
		const res = await sbx('http://unmocked.com');
		expect(res.status).toEqual(202);
	});

	it('calls fetch with original Request object', async () => {
		const sbx = fm.sandbox();
		let calledWith;

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
			fm.realFetch = async () => ({ status: 202 });
			fm.config.fallbackToNetwork = 'always';

			fm.mock('http://mocked.com', 201);
			const res = await fm.fetchHandler('http://unmocked.com');
			expect(res.status).toEqual(202);
		});

		it('ignores routes that are not matched', async () => {
			fm.realFetch = async () => ({ status: 202 });

			fm.config.fallbackToNetwork = 'always';

			fm.mock('http://mocked.com', 201);
			const res = await fm.fetchHandler('http://unmocked.com');
			expect(res.status).toEqual(202);
		});
	});

	describe.skip('warnOnFallback', () => {
		it('warn on fallback response by default', () => {});
		it("don't warn on fallback response when configured false", () => {});
	});
});
