import {
	afterEach, describe, expect, it, beforeAll, vi,
} from 'vitest';

const { fetchMock } = testGlobals;
describe('repeat and done()', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('can expect a route to be called',  () => {
		fm.mock('http://a.com/', 200);

		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(false);
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(true);
		expect(fm.done('http://a.com/')).toBe(true);
	});

	it('can expect a route to be called n times',  () => {
		fm.mock('http://a.com/', 200, { repeat: 2 });

		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(false);
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(true);
		expect(fm.done('http://a.com/')).toBe(true);
	});

	it('regression: can expect an un-normalized url to be called n times',  () => {
		fm.mock('http://a.com/', 200, { repeat: 2 });
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(false);
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(true);
	});

	it('can expect multiple routes to have been called',  () => {
		fm.mock('http://a.com/', 200, {
			repeat: 2,
		}).mock('http://b.com/', 200, { repeat: 2 });

		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(false);
		expect(fm.done('http://b.com/')).toBe(false);
		fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(true);
		expect(fm.done('http://b.com/')).toBe(false);
		fm.fetchHandler('http://b.com/');
		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(true);
		expect(fm.done('http://b.com/')).toBe(false);
		fm.fetchHandler('http://b.com/');
		expect(fm.done()).toBe(true);
		expect(fm.done('http://a.com/')).toBe(true);
		expect(fm.done('http://b.com/')).toBe(true);
	});

	// todo more tests for filtering
	it('`done` filters on match types', async () => {
		fm.once('http://a.com/', 200)
			.once('http://b.com/', 200)
			.once('http://c.com/', 200)
			.catch();

		await fm.fetchHandler('http://a.com/');
		await fm.fetchHandler('http://b.com/');
		expect(fm.done()).toBe(false);
		expect(fm.done(true)).toBe(false);
		expect(fm.done('http://a.com/')).toBe(true);
		expect(fm.done('http://b.com/')).toBe(true);
		expect(fm.done('http://c.com/')).toBe(false);
	});

	it("can tell when done if using '*'", () => {
		fm.mock('*', '200');
		fm.fetchHandler('http://a.com');
		expect(fm.done()).toBe(true);
	});

	it('can tell when done if using begin:', () => {
		fm.mock('begin:http', '200');
		fm.fetchHandler('http://a.com');
		expect(fm.done()).toBe(true);
	});

	it("won't mock if route already matched enough times", async () => {
		fm.mock('http://a.com/', 200, { repeat: 1 });

		await fm.fetchHandler('http://a.com/');
		try {
			await fm.fetchHandler('http://a.com/');
			expect.unreachable("Previous line should throw");
		} catch (err) {}
	});

	it('falls back to second route if first route already done', async () => {
		fm.mock('http://a.com/', 404, {
			repeat: 1,
		}).mock('http://a.com/', 200, { overwriteRoutes: false });

		const res = await fm.fetchHandler('http://a.com/');
		expect(res.status).toEqual(404);

		const res2 = await fm.fetchHandler('http://a.com/');
		expect(res2.status).toEqual(200);
	});

	it('resetHistory() resets count', async () => {
		fm.mock('http://a.com/', 200, { repeat: 1 });
		await fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(true);
		fm.resetHistory();
		expect(fm.done()).toBe(false);
		expect(fm.done('http://a.com/')).toBe(false);
		await fm.fetchHandler('http://a.com/');
		expect(fm.done()).toBe(true);
		expect(fm.done('http://a.com/')).toBe(true);
	});

	it('logs unmatched calls', () => {
		vi.spyOn(console, 'warn'); //eslint-disable-line
		fm.mock('http://a.com/', 200).mock('http://b.com/', 200, {
			repeat: 2,
		});

		fm.fetchHandler('http://b.com/');
		fm.done();
		expect(console.warn).toHaveBeenCalledWith('Warning: http://a.com/ not called') //eslint-disable-line
		expect(console.warn).toHaveBeenCalledWith(
			'Warning: http://b.com/ only called 1 times, but 2 expected',
			); //eslint-disable-line

		console.warn.mockClear(); //eslint-disable-line
		fm.done('http://a.com/');
		expect(console.warn).toHaveBeenCalledWith('Warning: http://a.com/ not called'); //eslint-disable-line
		expect(console.warn).not.toHaveBeenCalledWith(
			'Warning: http://b.com/ only called 1 times, but 2 expected',
			)//eslint-disable-line
			console.warn.mockRestore(); //eslint-disable-line
	});

	describe('sandbox isolation', () => {
		it("doesn't propagate to children of global", () => {
			fm.mock('http://a.com/', 200, { repeat: 1 });

			const sb1 = fm.sandbox();

			fm.fetchHandler('http://a.com/');

			expect(fm.done()).toBe(true);
			expect(sb1.done()).toBe(false);

			expect(() => sb1.fetchHandler('http://a.com/')).not.toThrow();
		});

		it("doesn't propagate to global from children", () => {
			fm.mock('http://a.com/', 200, { repeat: 1 });

			const sb1 = fm.sandbox();

			sb1.fetchHandler('http://a.com/');

			expect(fm.done()).toBe(false);
			expect(sb1.done()).toBe(true);

			expect(() => fm.fetchHandler('http://a.com/')).not.toThrow();
		});

		it("doesn't propagate to children of sandbox", () => {
			const sb1 = fm.sandbox().mock('http://a.com/', 200, { repeat: 1 });

			const sb2 = sb1.sandbox();

			sb1.fetchHandler('http://a.com/');

			expect(sb1.done()).toBe(true);
			expect(sb2.done()).toBe(false);

			expect(() => sb2.fetchHandler('http://a.com/')).not.toThrow();
		});

		it("doesn't propagate to sandbox from children", () => {
			const sb1 = fm.sandbox().mock('http://a.com/', 200, { repeat: 1 });

			const sb2 = sb1.sandbox();

			sb2.fetchHandler('http://a.com/');

			expect(sb1.done()).toBe(false);
			expect(sb2.done()).toBe(true);

			expect(() => sb1.fetchHandler('http://a.com/')).not.toThrow();
		});

		it('Allow overwriting routes when using multiple function matchers', async () => {
			const matcher1 = () => true;

			const matcher2 = () => true;

			const sb = fm.sandbox();

			expect(() => sb.postOnce(matcher1, 200).postOnce(matcher2, 200)).not.toThrow();

			await sb('https://example.com/', { method: 'POST' });
			expect(sb.done()).toBe(false);
			expect(sb.done(matcher1)).toBe(true);
			expect(sb.done(matcher2)).toBe(false);
			await sb('https://example.com/', { method: 'POST' });

			expect(sb.done()).toBe(true);
			expect(sb.done(matcher1)).toBe(true);
			expect(sb.done(matcher2)).toBe(true);
		});
	});
});
