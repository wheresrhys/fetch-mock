import { describe, expect, it, vi } from "vitest";

const { fetchMock, theGlobal } = testGlobals;
describe('spy()', () => {
	it('when mocking globally, spy falls through to global fetch', async () => {
		const originalFetch = theGlobal.fetch;
		const fetchSpy = vi.fn().mockResolvedValue('example');

		theGlobal.fetch = fetchSpy;

		fetchMock.spy();

		await theGlobal.fetch('http://a.com/', { method: 'get' });
			expect(fetchSpy).toHaveBeenCalledWith('http://a.com/', { method: 'get' }, undefined);
		fetchMock.restore();
		theGlobal.fetch = originalFetch;
	});

	it('when mocking locally, spy falls through to configured fetch', async () => {
		const fetchSpy = vi.fn().mockResolvedValue('dummy');

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy();
		await fm.fetchHandler('http://a.com/', { method: 'get' });
			expect(fetchSpy).toHaveBeenCalledWith('http://a.com/', { method: 'get' }, undefined);
		fm.restore();
	});

	it('can restrict spying to a route', async () => {
		const fetchSpy = vi.fn().mockResolvedValue('dummy');

		const fm = fetchMock.sandbox();
		fm.config.fetch = fetchSpy;

		fm.spy({ url: 'http://a.com/', method: 'get' });
		await fm.fetchHandler('http://a.com/', { method: 'get' });
		expect(fetchSpy).toHaveBeenCalledWith('http://a.com/', { method: 'get' }, undefined);

		expect(() =>
			fm.fetchHandler('http://b.com/', { method: 'get' })
		).toThrow();
		expect(() =>
			fm.fetchHandler('http://a.com/', { method: 'post' })
		).toThrow();
		fm.restore();
	});
});
