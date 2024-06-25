import { afterEach, describe, expect, it, beforeAll } from 'vitest';

const { fetchMock } = testGlobals;
describe('multiple routes', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('property on first parameter', () => {
		fm.route({ url: 'http://a.com', name: 'my-name' }, 200);
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).toBe(true);
	});

	it('property on first parameter when only one parameter supplied', () => {
		fm.route({ name: 'my-name', url: 'http://a.com', response: 200 });
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).toBe(true);
	});

	it('property on third parameter', () => {
		fm.route('http://a.com', 200, { name: 'my-name' });
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).toBe(true);
	});

	it('string in third parameter', () => {
		fm.route('http://a.com', 200, 'my-name');
		fm.fetchHandler('http://a.com');
		expect(fm.called('my-name')).toBe(true);
	});
});
