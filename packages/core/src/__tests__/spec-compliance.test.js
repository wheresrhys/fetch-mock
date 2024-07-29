import { describe, expect, it, beforeAll } from 'vitest';
import fetchMock from '../FetchMock';
describe('Spec compliance', () => {
	// NOTE: these are not exhaustive, but feel like a sensible, reasonably easy to implement subset
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
	describe('exceptions', () => {
		beforeAll(() => fetchMock.catch());
		it('reject on invalid header name', async () => {
			await expect(
				fetchMock.fetchHandler('http://a.com', {
					headers: {
						'has space': 'ok',
					},
				}),
			).rejects.toThrow(new TypeError('asdasdsa'));
		});
		it('reject on invalid header value', async () => {
			await expect(
				fetchMock.fetchHandler('http://a.com', {
					headers: [['a', 'b', 'c']],
				}),
			).rejects.toThrow(new TypeError('asdasdsa'));
		});
		it('reject on url containing credentials', async () => {
			await expect(
				fetchMock.fetchHandler('http://user:password@a.com'),
			).rejects.toThrow(new TypeError('asdasdsa'));
		});
		it('reject on invalid modes', async () => {
			await expect(
				fetchMock.fetchHandler('http://a.com', { mode: 'websocket' }),
			).rejects.toThrow(new TypeError('asdasdsa'));
			await expect(
				fetchMock.fetchHandler('http://a.com', { mode: 'navigate' }),
			).rejects.toThrow(new TypeError('asdasdsa'));
		});
		it('reject if the request method is GET or HEAD and the body is non-null.', async () => {
			await expect(
				fetchMock.fetchHandler('http://a.com', { body: 'a' }),
			).rejects.toThrow(new TypeError('asdasdsa'));
			await expect(
				fetchMock.fetchHandler('http://a.com', { body: 'a', method: 'GET' }),
			).rejects.toThrow(new TypeError('asdasdsa'));
			await expect(
				fetchMock.fetchHandler('http://a.com', { body: 'a', method: 'HEAD' }),
			).rejects.toThrow(new TypeError('asdasdsa'));
		});
	});
});
