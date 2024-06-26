import { beforeEach, describe, expect, it } from 'vitest';
import fetchMock from '../../FetchMock.js';

import Route from '../../Route.js';

describe('Routing', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	describe('FetchMock.route()', () => {});

	describe('naming routes', () => {

		it('property on first parameter', () => {
			fm.route({ url: 'http://a.com', name: 'my-name' }, 200);
			expect(fm.router.routes[0].config.name).toBe('my-name')
		});

		it('property on first parameter when only one parameter supplied', () => {
			fm.route({ name: 'my-name', url: 'http://a.com', response: 200 });
			expect(fm.router.routes[0].config.name).toBe('my-name')
		});

		it('property on third parameter', () => {
			fm.route('http://a.com', 200, { name: 'my-name' });
			expect(fm.router.routes[0].config.name).toBe('my-name')
		});

		it('string in third parameter', () => {
			fm.route('http://a.com', 200, 'my-name');
			expect(fm.router.routes[0].config.name).toBe('my-name')
		});
	});


	describe('FetchMock.catch()', () => {
		describe('unmatched calls', () => {
			it('throws if any calls unmatched by default', async () => {
				fm.route('http://a.com', 200);
				await expect(fm.fetchHandler('http://b.com')).rejects.toThrow();
			});

			it('catch unmatched calls with empty 200 by default', async () => {
				fm.catch();
				await expect(fm.fetchHandler('http://a.com')).resolves.toMatchObject({status: 200});
			});

			it('can catch unmatched calls with custom response', async () => {
				fm.catch(300);
				await expect(fm.fetchHandler('http://a.com')).resolves.toMatchObject({ status: 300 });
			});

			it('can catch unmatched calls with function', async () => {
				fm.catch(() => new fm.config.Response('i am text', { status: 400 }));
				const response = await fm.fetchHandler('http://a.com');
				expect(response).toMatchObject({ status: 400 });
				await expect(response.text()).resolves.toEqual('i am text');
			});
		});
	})
});
