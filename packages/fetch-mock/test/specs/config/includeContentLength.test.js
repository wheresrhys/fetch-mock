import { beforeEach, describe, expect, it } from 'vitest';

import fetchMock from '../../../src/index.js';

describe('includeContentLength', () => {
	let fm;
	beforeEach(() => {
		fm = fetchMock.createInstance();
	});
	it('include content-length header by default', async () => {
		fm.mock('*', 'content');
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-length')).toEqual('7');
	});

	it("don't include when configured false", async () => {
		fm.config.includeContentLength = false;
		fm.mock('*', 'content');
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-length')).toBeNull();
	});

	it('local setting can override to true', async () => {
		fm.config.includeContentLength = false;
		fm.mock('*', 'content', { includeContentLength: true });
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-length')).toEqual('7');
	});

	it('local setting can override to false', async () => {
		fm.config.includeContentLength = true;
		fm.mock('*', 'content', { includeContentLength: false });
		const res = await fm.fetchHandler('http://it.at.there');
		expect(res.headers.get('content-length')).toBeNull();
	});
});
