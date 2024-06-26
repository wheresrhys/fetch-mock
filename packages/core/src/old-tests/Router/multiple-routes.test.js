import { afterEach, describe, expect, it, beforeAll } from 'vitest';

const { fetchMock } = testGlobals;
describe('multiple routes', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match several routes with one instance', async () => {
		fm.route('http://b.com/', 200).route('http://a.com/', 200);

		await fm.fetchHandler('http://b.com/');
		expect(fm.calls(true).length).toEqual(1);
		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match first route that matches', async () => {
		fm.route('http://a.com/', 200).route('begin:http://a.com/', 300);

		const res = await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).toEqual(1);
		expect(res.status).toEqual(200);
	});

	describe('duplicate routes', () => {
		it('error when duplicate route added using explicit route name', () => {
			expect(() =>
				fm
					.route('http://a.com/', 200, { name: 'jam' })
					.route('begin:http://a.com/', 300, { name: 'jam' }),
			).toThrow();
		});

		it('error when duplicate route added using implicit route name', () => {
			expect(() =>
				fm.route('http://a.com/', 200).route('http://a.com/', 300),
			).toThrow();
		});

		it("don't error when duplicate route added with non-clashing method", () => {
			expect(() =>
				fm
					.route('http://a.com/', 200, { method: 'GET' })
					.route('http://a.com/', 300, { method: 'POST' }),
			).not.toThrow();
		});

		it('error when duplicate route added with no method', () => {
			expect(() =>
				fm
					.route('http://a.com/', 200, { method: 'GET' })
					.route('http://a.com/', 300),
			).toThrow();
		});

		it('error when duplicate route added with clashing method', () => {
			expect(() =>
				fm
					.route('http://a.com/', 200, { method: 'GET' })
					.route('http://a.com/', 300, { method: 'GET' }),
			).toThrow();
		});

		it('allow overwriting existing route', async () => {
			expect(() =>
				fm
					.route('http://a.com/', 200)
					.route('http://a.com/', 300, { overwriteRoutes: true }),
			).not.toThrow();

			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(300);
		});

		it('overwrite correct route', async () => {
			expect(() =>
				fm
					.route('http://bar.co/', 200)
					.route('http://foo.co/', 400)
					.route('http://bar.co/', 300, { overwriteRoutes: true }),
			).not.toThrow();
			const res = await fm.fetchHandler('http://foo.co/');
			expect(res.status).toEqual(400);
		});

		it('allow adding additional route with same matcher', async () => {
			expect(() =>
				fm
					.route('http://a.com/', 200, { repeat: 1 })
					.route('http://a.com/', 300, { overwriteRoutes: false }),
			).not.toThrow();

			const res = await fm.fetchHandler('http://a.com/');
			expect(res.status).toEqual(200);
			const res2 = await fm.fetchHandler('http://a.com/');
			expect(res2.status).toEqual(300);
		});

		it("don't require overwrite route when only difference is method", () => {
			fm.route('http://a.com/', 200, { method: 'POST' })
				.route('http://a.com/', 200, { method: 'GET' })
				.catch();
		});

		it('overwrite multiple routes', async () => {
			fm.route('http://a.com/', 200, { method: 'POST' })
				.route('http://a.com/', 200, { method: 'GET' })
				.route('http://a.com/', 300, { overwriteRoutes: true })
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
