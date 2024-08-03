/*global jest, beforeAll, afterAll */
jest.mock('node-fetch', () => require('../server').sandbox());
const fetch = require('node-fetch');
describe('jest extensions', () => {
	describe('when no calls', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
		});
		afterAll(() => fetch.reset());
		it('toHaveFetched should be falsy', () => {
			expect(fetch).not.toHaveFetched('http://example.com/path');
		});

		it('toHaveLastFetched should be falsy', () => {
			expect(fetch).not.toHaveLastFetched('http://example.com/path');
		});

		it('toHaveNthFetched should be falsy', () => {
			expect(fetch).not.toHaveNthFetched(1, 'http://example.com/path');
		});

		it('toHaveFetchedTimes should be falsy', () => {
			expect(fetch).not.toHaveFetchedTimes(1, 'http://example.com/path');
		});

		it('toBeDone should be falsy', () => {
			expect(fetch).not.toBeDone();
			expect(fetch).not.toBeDone('http://example.com/path');
		});
	});
	describe('toHaveFetched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path2', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveFetched('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveFetched('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveFetched('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveFetched('http://example.com/path', {
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveFetched('http://example-no.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
	});
	describe('toHaveLastFetched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveLastFetched('http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveLastFetched('begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveLastFetched('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveLastFetched('http://example.com/path', {
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveLastFetched('http://example-no.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
	});

	describe('toHaveNthFetched', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example1.com/path', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveNthFetched(2, 'http://example2.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveNthFetched(2, 'begin:http://example2.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveNthFetched(2, 'http://example2.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveNthFetched(2, 'http://example2.com/path', {
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveNthFetched(2, 'http://example-no.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if wrong n", () => {
			expect(fetch).not.toHaveNthFetched(1, 'http://example2.com/path');
		});
	});

	describe('toHaveFetchedTimes', () => {
		beforeAll(() => {
			fetch.mock('*', 200);
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toHaveFetchedTimes(2, 'http://example.com/path');
		});

		it('matches with fetch-mock matcher', () => {
			expect(fetch).toHaveFetchedTimes(2, 'begin:http://example.com/path');
		});

		it('matches with matcher and options', () => {
			expect(fetch).toHaveFetchedTimes(2, 'http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if matcher but not options is correct", () => {
			expect(fetch).not.toHaveFetchedTimes(2, 'http://example.com/path', {
				headers: {
					test: 'not-header',
				},
			});
		});

		it("doesn't match if options but not matcher is correct", () => {
			expect(fetch).not.toHaveFetchedTimes(2, 'http://example-no.com/path', {
				headers: {
					test: 'header',
				},
			});
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toHaveFetchedTimes(1, 'http://example.com/path');
		});

		it("doesn't match if too many calls", () => {
			expect(fetch).not.toHaveFetchedTimes(3, 'http://example.com/path');
		});
	});

	describe('toBeDone', () => {
		beforeAll(() => {
			fetch.once('http://example.com/path', 200);
			fetch.mock('http://example2.com/path', 200, { repeat: 2 });
			fetch('http://example.com/path', {
				headers: {
					test: 'header',
				},
			});
			fetch('http://example2.com/path', {
				headers: {
					test: 'header',
				},
			});
		});
		afterAll(() => fetch.reset());

		it('matches with just url', () => {
			expect(fetch).toBeDone('http://example.com/path');
		});

		it("doesn't match if too few calls", () => {
			expect(fetch).not.toBeDone('http://example2.com/path');
		});
	});
});
