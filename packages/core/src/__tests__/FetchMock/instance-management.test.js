import { describe, expect, it, beforeEach } from 'vitest';
import fetchMock from '../../FetchMock';

describe('instance management', () => {
	describe('instance isolation', () => {
		it('not be the parent', () => {
			const child = fetchMock.createInstance();
			expect(child).not.toBe(fetchMock);
		});
		it('inherit settings from parent instance', () => {
			const parent = fetchMock.createInstance();
			parent.config.Headers = { example: true };
			const child = parent.createInstance();
			expect(child.config.Headers).toEqual({ example: true });
		});

		it('implement full fetch-mock api', () => {
			const child = fetchMock.createInstance();
			//eslint-disable-next-line guard-for-in
			for (const key in fetchMock) {
				expect(typeof child[key]).toEqual(typeof fetchMock[key]);
			}
		});

		it('has an isolated router', async () => {
			const parent = fetchMock.createInstance();
			const child = parent.createInstance();

			parent.route('http://a.com', 200).catch(404);
			child.route('http://b.com', 200).catch(404);

			await expect(parent.fetchHandler('http://a.com')).resolves.toMatchObject({
				status: 200,
			});
			await expect(parent.fetchHandler('http://b.com')).resolves.toMatchObject({
				status: 404,
			});
			await expect(child.fetchHandler('http://a.com')).resolves.toMatchObject({
				status: 404,
			});
			await expect(child.fetchHandler('http://b.com')).resolves.toMatchObject({
				status: 200,
			});
		});

		it('can extend a router', async () => {
			const parent = fetchMock.createInstance();
			parent.route('http://a.com', 200);
			const child = parent.createInstance();
			child.route('http://b.com', 200);
			await expect(parent.fetchHandler('http://a.com')).resolves.toMatchObject({
				status: 200,
			});
			await expect(parent.fetchHandler('http://b.com')).rejects.toThrow();
			await expect(child.fetchHandler('http://a.com')).resolves.toMatchObject({
				status: 200,
			});
			await expect(child.fetchHandler('http://b.com')).resolves.toMatchObject({
				status: 200,
			});
		});

		it('inherits fallback routes', async () => {
			const parent = fetchMock.createInstance().catch(404);
			const child = parent.createInstance();
			console.log(child.router);
			await expect((await child.fetchHandler('http://a.com')).status).toBe(404);
		});

		it('has an isolated call history', async () => {
			const parent = fetchMock.createInstance().route('http://a.com', 200);
			const child = parent.createInstance();

			await parent.fetchHandler('http://a.com');
			expect(parent.callHistory.callLogs.length).toBe(1);
			expect(child.callHistory.callLogs.length).toBe(0);
			await child.fetchHandler('http://a.com');
			expect(parent.callHistory.callLogs.length).toBe(1);
			expect(child.callHistory.callLogs.length).toBe(1);
		});
		it('does not inherit call history', async () => {
			const parent = fetchMock.createInstance().route('http://a.com', 200);
			await parent.fetchHandler('http://a.com');
			const child = parent.createInstance();
			expect(parent.callHistory.callLogs.length).toBe(1);
			expect(child.callHistory.callLogs.length).toBe(0);
		});
	});
	describe('resetting', () => {
		it('can have all its routes removed', async () => {
			const fm = fetchMock
				.createInstance()
				.route('http://a.com', 200)
				.route('http://b.com', 200);

			await fm.fetchHandler('http://a.com');
			fm.removeRoutes();
			expect(fm.router.routes.length).toBe(0);
			// should have no effect on call history - this is a low level API
			// and in user APIs provided wrappers these will probably be combined
			// but in here keeping them separate gives more flexibilty
			expect(fm.callHistory.callLogs.length).toBe(1);
		});

		it('can have selected named routes removed', () => {
			const fm = fetchMock
				.createInstance()
				.route('http://a.com', 200, 'george')
				.route('http://b.com', 200, 'best');
			// TODO overload to also support 'george' or ['george']'
			// Probably do the normalization at the FM level
			fm.removeRoutes({ names: ['george'] });
			expect(fm.router.routes[0].config.name).toBe('best');
		});

		it('can retain the fallback route', () => {
			const fm = fetchMock.createInstance().catch(404);
			fm.removeRoutes({ includeFallback: false });
			expect(fm.router.fallbackRoute).toBeDefined();
			fm.removeRoutes();
			expect(fm.router.fallbackRoute).toBeUndefined();
		});

		it('can force removal of sticky routes', () => {
			const fm = fetchMock
				.createInstance()
				.route('http://a.com', 200)
				.route('http://b.com', 200, { sticky: true, name: 'sticky' });
			fm.removeRoutes();
			expect(fm.router.routes[0].config.name).toBe('sticky');
			fm.removeRoutes({ includeSticky: true });
			expect(fm.router.routes.length).toBe(0);
		});

		it('can have its call history wiped', async () => {
			const fm = fetchMock.createInstance().route('http://a.com', 200);
			await fm.fetchHandler('http://a.com');
			fm.clearHistory();
			expect(fm.callHistory.callLogs.length).toBe(0);
		});
	});

	describe('sticky routes', () => {
		let fm;
		beforeEach(() => {
			fm = fetchMock.createInstance();
		});
		it('do not get removed by default', () => {
			fm.route('*', 200, { sticky: true }).removeRoutes();
			expect(fm.router.routes.length).toEqual(1);
		});

		it('get removed when forced', () => {
			fm.route('*', 200, { sticky: true }).removeRoutes({
				includeSticky: true,
			});
			expect(fm.router.routes.length).toEqual(0);
		});
	});
});
