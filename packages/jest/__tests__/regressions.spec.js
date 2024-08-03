/*global jest */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');

describe('regressions and strange cases', () => {
	it('works even when jest.resetAllMocks() is called', () => {
		jest.resetAllMocks();
		fetch.mock('*', 200);
		fetch('http://example.com/path', 200);
		expect(fetch).toHaveFetched('http://example.com/path');
		fetch.reset();
	});
	it('works even when jest.clearAllMocks() is called', () => {
		jest.clearAllMocks();
		fetch.mock('*', 200);
		fetch('http://example.com/path', 200);
		expect(fetch).toHaveFetched('http://example.com/path');
		fetch.reset();
	});
});
