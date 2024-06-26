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