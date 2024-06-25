import { afterEach, describe, expect, it, beforeAll } from 'vitest';

const { fetchMock } = testGlobals;
describe('path parameter matching', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('can match a path parameters', async () => {
		fm.route('express:/type/:instance', 200, {
			params: { instance: 'b' },
		}).catch();
		await fm.fetchHandler('/');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/type/a');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/type/b');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match multiple path parameters', async () => {
		fm.route('express:/:type/:instance', 200, {
			params: { instance: 'b', type: 'cat' },
		}).catch();
		await fm.fetchHandler('/');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/dog/a');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/cat/a');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/dog/b');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/cat/b');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('can match a path parameter on a full url', async () => {
		fm.route('express:/type/:instance', 200, {
			params: { instance: 'b' },
		}).catch();
		await fm.fetchHandler('http://site.com/');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://site.com/type/a');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://site.com/type/b');
		expect(fm.calls(true).length).toEqual(1);
	});
});
