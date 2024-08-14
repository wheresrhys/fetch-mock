import { afterEach, describe, expect, it, beforeAll } from 'vitest';

import fetchMock from '../../../src/index.js';
describe('multiple routes', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match several routes with one instance', async () => {
		fm.mock('http://b.com/', 200).mock('http://a.com/', 200);

		await fm.fetchHandler('http://b.com/');
		expect(fm.calls(true).length).toEqual(1);
		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match first route that matches', async () => {
		fm.mock('http://a.com/', 200).mock('begin:http://a.com/', 300);

		const res = await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).toEqual(1);
		expect(res.status).toEqual(200);
	});

	describe('duplicate routes', () => {
		it('error when duplicate route added using explicit route name', () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200, { name: 'jam' })
					.mock('begin:http://a.com/', 300, { name: 'jam' }),
			).toThrow();
		});

		it('error when duplicate route added using implicit route name', () => {
			expect(() =>
				fm.mock('http://a.com/', 200).mock('http://a.com/', 300),
			).toThrow();
		});

		it("don't error when duplicate route added with non-clashing method", () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200, { method: 'GET' })
					.mock('http://a.com/', 300, { method: 'POST' }),
			).not.toThrow();
		});

		it('error when duplicate route added with no method', () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200, { method: 'GET' })
					.mock('http://a.com/', 300),
			).toThrow();
		});

		it('error when duplicate route added with clashing method', () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200, { method: 'GET' })
					.mock('http://a.com/', 300, { method: 'GET' }),
			).toThrow();
		});

		it('allow overwriting existing route', async () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200)
					.mock('http://a.com/', 300, { overwriteRoutes: true }),
			).not.toThrow();

			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(300);
		});

		it('overwrite correct route', async () => {
			expect(() =>
				fm
					.mock('http://bar.co/', 200)
					.mock('http://foo.co/', 400)
					.mock('http://bar.co/', 300, { overwriteRoutes: true }),
			).not.toThrow();
			const res = await fm.fetchHandler('http://foo.co/');
			expect(res.status).toEqual(400);
		});

		it('allow adding additional route with same matcher', async () => {
			expect(() =>
				fm
					.mock('http://a.com/', 200, { repeat: 1 })
					.mock('http://a.com/', 300, { overwriteRoutes: false }),
			).not.toThrow();

			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
			const res2 = await fm.fetchHandler('http://a.com/');
			expect(res2.status).toEqual(300);
		});

		it("don't require overwrite route when only difference is method", () => {
			fm.mock('http://a.com/', 200, { method: 'POST' })
				.mock('http://a.com/', 200, { method: 'GET' })
				.catch();
		});

		it('overwrite multiple routes', async () => {
			fm.mock('http://a.com/', 200, { method: 'POST' })
				.mock('http://a.com/', 200, { method: 'GET' })
				.mock('http://a.com/', 300, { overwriteRoutes: true })
				.catch();
			const res1 = await fm.fetchHandler('http://a.com/');
			expect(res1.status).toEqual(300);
			const res2 = await fm.fetchHandler('http://a.com/', {
				method: 'post',
			});
			expect(res2.status).toEqual(300);
		});
	});
});
