import './custom-jsdom-environment';
import fetchMock from '../index';
import { describe, it, expect } from '@jest/globals';

fetchMock.mockGlobal().get('http://example.com', { status: 418 });

describe('compatibility with jsdom', () => {
	it('can fetch stuff', async () => {
		const r = await fetch('http://example.com');
		expect(r.status).toEqual(418);
	});
});
