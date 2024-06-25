import { afterEach, describe, expect, it, beforeAll } from 'vitest';

const { fetchMock } = testGlobals;
describe('unmatched calls', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('throws if any calls unmatched', () => {
		fm.route(/a/, 200);
		expect(() => fm.fetchHandler('http://1')).toThrow();
	});

	it('catch unmatched calls with empty 200 by default', async () => {
		fm.catch();

		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).toEqual(1);
		expect(res.status).toEqual(200);
	});

	it('can catch unmatched calls with custom response', async () => {
		fm.catch({ iam: 'json' });

		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).toEqual(1);
		expect(res.status).toEqual(200);
		expect(await res.json()).toEqual({ iam: 'json' });
	});

	it('can catch unmatched calls with function', async () => {
		fm.catch(() => new fm.config.Response('i am text', { status: 200 }));
		const res = await fm.fetchHandler('http://1');
		expect(fm.calls(false).length).toEqual(1);
		expect(res.status).toEqual(200);
		expect(await res.text()).toEqual('i am text');
	});
});
